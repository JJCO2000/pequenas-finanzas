import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const automaticTriggers = new Set([
  'push',
  'pull_request',
  'pull_request_target',
  'workflow_run',
  'repository_dispatch',
  'schedule',
]);

const automaticNpmLifecycle = new Set([
  'preinstall',
  'install',
  'postinstall',
  'prepare',
  'prepack',
  'postpack',
  'prepublish',
  'prepublishOnly',
  'publish',
  'postpublish',
]);

const manualSensitiveEntrypoints = [
  /(?:^|[\\/])BUILD_ANDROID\.ps1\b/i,
  /(?:^|[\\/])SUBMIT_ANDROID\.ps1\b/i,
  /(?:^|[\\/])SETUP_GOOGLE_PLAY\.ps1\b/i,
];

function fail(message) {
  failures.push(message);
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function normalizeRel(file) {
  return path.relative(root, file).replaceAll('\\', '/');
}

function listFilesRecursive(relDir, predicate = () => true) {
  const start = path.join(root, relDir);
  if (!fs.existsSync(start)) return [];
  const output = [];
  const stack = [start];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && predicate(full)) output.push(normalizeRel(full));
    }
  }
  return output.sort();
}

function stripQuotes(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseOnEvents(source) {
  const lines = source.split(/\r?\n/);
  const onIndex = lines.findIndex((line) => /^\s*on\s*:\s*/.test(line));
  if (onIndex < 0) return new Set();

  const baseIndent = lines[onIndex].length - lines[onIndex].trimStart().length;
  const inline = lines[onIndex].replace(/^\s*on\s*:\s*/, '').trim();
  if (inline) {
    if (inline.startsWith('[') && inline.endsWith(']')) {
      return new Set(inline.slice(1, -1).split(',').map((item) => stripQuotes(item)).filter(Boolean));
    }
    return new Set([stripQuotes(inline)]);
  }

  const candidates = [];
  for (let index = onIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const indent = line.length - line.trimStart().length;
    if (indent <= baseIndent) break;
    candidates.push({ line, indent });
  }
  if (candidates.length === 0) return new Set();

  const minIndent = Math.min(...candidates.map(({ indent }) => indent));
  const events = new Set();
  for (const { line, indent } of candidates) {
    if (indent !== minIndent) continue;
    const trimmed = line.trim();
    const keyMatch = /^([^:#\s]+)\s*:/.exec(trimmed);
    const listMatch = /^-\s*([^:#\s]+)\s*$/.exec(trimmed);
    const event = keyMatch?.[1] ?? listMatch?.[1];
    if (event) events.add(stripQuotes(event));
  }
  return events;
}

function extractRunBlocks(source) {
  const lines = source.split(/\r?\n/);
  const runs = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = /^(\s*)(?:-\s*)?run\s*:\s*(.*)$/.exec(lines[index]);
    if (!match) continue;
    const indent = match[1].length;
    const inline = match[2].trim();
    if (inline && !/^[|>]-?$/.test(inline)) {
      runs.push(stripQuotes(inline));
      continue;
    }
    const block = [];
    for (let child = index + 1; child < lines.length; child += 1) {
      const line = lines[child];
      if (!line.trim()) {
        block.push('');
        continue;
      }
      const childIndent = line.length - line.trimStart().length;
      if (childIndent <= indent) break;
      block.push(line.trimStart());
    }
    runs.push(block.join('\n'));
  }
  return runs;
}

function extractLocalUses(source) {
  const uses = [];
  const regex = /^\s*(?:-\s*)?uses\s*:\s*['"]?([^'"\s#]+)['"]?/gmi;
  let match;
  while ((match = regex.exec(source)) !== null) {
    if (match[1].startsWith('./.github/')) uses.push(match[1].replace(/^\.\//, ''));
  }
  return uses;
}

function stripShellComment(line) {
  let quote = null;
  let escaped = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '#') return line.slice(0, index);
  }
  return line;
}

function splitShellSegments(source) {
  const segments = [];
  let current = '';
  let quote = null;
  let escaped = false;
  const flush = () => {
    const cleaned = stripShellComment(current).trim();
    if (cleaned) segments.push(cleaned);
    current = '';
  };

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === '\\') {
      current += char;
      escaped = true;
      continue;
    }
    if (quote) {
      current += char;
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      current += char;
      continue;
    }
    if (char === '\n' || char === ';' || (char === '&' && next === '&') || (char === '|' && next === '|')) {
      flush();
      if ((char === '&' && next === '&') || (char === '|' && next === '|')) index += 1;
      continue;
    }
    current += char;
  }
  flush();
  return segments;
}

function normalizeShellSegment(segment) {
  let value = segment.trim();
  value = value.replace(/^(?:then|do)\s+/i, '');
  value = value.replace(/^(?:[A-Za-z_][A-Za-z0-9_]*=(?:"[^"]*"|'[^']*'|[^\s]+)\s+)*/, '');
  value = value.replace(/^sudo\s+/i, '');
  return value.trim();
}

const packageJson = JSON.parse(read('package.json'));
const packageScripts = packageJson.scripts ?? {};

function directShellLabels(segment) {
  const labels = new Set();
  if (/^(?:(?:npx|pnpm\s+dlx|yarn\s+dlx|npm\s+exec(?:\s+--)?)[ \t]+)?eas(?:-cli)?[ \t]+update\b/i.test(segment)) labels.add('eas update');
  if (/^(?:(?:npx|pnpm\s+dlx|yarn\s+dlx|npm\s+exec(?:\s+--)?)[ \t]+)?eas(?:-cli)?[ \t]+build(?:\s|$)/i.test(segment)) labels.add('eas build');
  if (/^(?:(?:npx|pnpm\s+dlx|yarn\s+dlx|npm\s+exec(?:\s+--)?)[ \t]+)?eas(?:-cli)?[ \t]+submit\b/i.test(segment)) labels.add('eas submit');
  if (/^(?:(?:npx|pnpm\s+dlx|yarn\s+dlx|npm\s+exec(?:\s+--)?)[ \t]+)?eas(?:-cli)?[ \t]+workflow(?::run|[ \t]+run)?\b/i.test(segment)) labels.add('eas workflow');
  if (/^(?:(?:npx|pnpm\s+dlx|yarn\s+dlx|npm\s+exec(?:\s+--)?)[ \t]+)?expo[ \t]+upload\b/i.test(segment)) labels.add('expo upload');
  if (/^(?:\.\/)?gradlew(?:\.bat)?[ \t]+bundle\w*\b/i.test(segment)) labels.add('gradlew bundle');
  if (/^gh[ \t]+workflow[ \t]+run\b/i.test(segment)) labels.add('gh workflow run');
  if (/\bcurl\b/i.test(segment) && /actions\/workflows\/.+\/dispatches\b/i.test(segment)) labels.add('GitHub workflow dispatch API');
  if (/\bcurl\b/i.test(segment) && /repos\/.+\/dispatches\b/i.test(segment)) labels.add('GitHub repository dispatch API');
  if (manualSensitiveEntrypoints.some((pattern) => pattern.test(segment))) labels.add('manual build/submit entrypoint');
  return labels;
}

function npmScriptNames(segment) {
  const names = [];
  const patterns = [
    /\bnpm\s+run\s+([A-Za-z0-9:_-]+)/gi,
    /\bpnpm\s+(?:run\s+)?([A-Za-z0-9:_-]+)/gi,
    /\byarn\s+(?:run\s+)?([A-Za-z0-9:_-]+)/gi,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(segment)) !== null) names.push(match[1]);
  }
  return names;
}

function detectExecutableShell(source, seenScripts = new Set()) {
  const labels = new Set();
  for (const rawSegment of splitShellSegments(source)) {
    const segment = normalizeShellSegment(rawSegment);
    if (!segment) continue;
    if (/^(?:echo|printf|Write-(?:Host|Output)|console\.log)\b/i.test(segment)) continue;
    for (const label of directShellLabels(segment)) labels.add(label);
    for (const scriptName of npmScriptNames(segment)) {
      if (seenScripts.has(scriptName)) continue;
      const command = packageScripts[scriptName];
      if (typeof command !== 'string') continue;
      const nestedSeen = new Set(seenScripts);
      nestedSeen.add(scriptName);
      for (const label of detectExecutableShell(command, nestedSeen)) labels.add(`npm:${scriptName} -> ${label}`);
    }
  }
  return [...labels];
}

function extractStringLiterals(source) {
  const values = [];
  const regex = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  let match;
  while ((match = regex.exec(source)) !== null) values.push(match[2]);
  return values;
}

function commandFromProgramAndArgs(program, argsSource) {
  return [program, ...extractStringLiterals(argsSource)].join(' ');
}

function detectExecutableJavaScript(source) {
  const labels = new Set();
  let match;
  const stringRunners = /(?:\b(?:exec|execSync|execaCommand|execaCommandSync)\s*\(|\b(?:child_process|childProcess|cp|shelljs)\.(?:exec|execSync)\s*\()\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  while ((match = stringRunners.exec(source)) !== null) {
    for (const label of detectExecutableShell(match[2])) labels.add(label);
  }

  const argvRunners = /(?:\b(?:spawn|spawnSync|execFile|execFileSync|execa|execaSync)\s*\(|\b(?:child_process|childProcess|cp|crossSpawn)\.(?:spawn|spawnSync|execFile|execFileSync)\s*\()\s*(['"`])([^'"`]+)\1\s*,\s*\[([\s\S]{0,1200}?)\]/g;
  while ((match = argvRunners.exec(source)) !== null) {
    for (const label of detectExecutableShell(commandFromProgramAndArgs(match[2], match[3]))) labels.add(label);
  }

  const taggedTemplates = /(?:\b(?:execaCommand|execaCommandSync)|\$)\s*`([^`]+)`/g;
  while ((match = taggedTemplates.exec(source)) !== null) {
    for (const label of detectExecutableShell(match[1])) labels.add(label);
  }

  const bunSpawn = /\bBun\.spawn(?:Sync)?\s*\(\s*\[([\s\S]{0,1200}?)\]/g;
  while ((match = bunSpawn.exec(source)) !== null) {
    for (const label of detectExecutableShell(extractStringLiterals(match[1]).join(' '))) labels.add(label);
  }

  const denoCommand = /\bnew\s+Deno\.Command\s*\(\s*(['"`])([^'"`]+)\1\s*,\s*\{([\s\S]{0,1600}?)\}\s*\)/g;
  while ((match = denoCommand.exec(source)) !== null) {
    const argsMatch = /args\s*:\s*\[([\s\S]{0,1000}?)\]/.exec(match[3]);
    for (const label of detectExecutableShell(commandFromProgramAndArgs(match[2], argsMatch?.[1] ?? ''))) labels.add(label);
  }
  return [...labels];
}

function resolveLocalUse(usePath) {
  const candidate = path.join(root, usePath);
  if (!fs.existsSync(candidate)) return null;
  if (fs.statSync(candidate).isFile()) return normalizeRel(candidate);
  for (const name of ['action.yml', 'action.yaml']) {
    const action = path.join(candidate, name);
    if (fs.existsSync(action)) return normalizeRel(action);
  }
  return null;
}

function yamlInfo(rel) {
  const source = read(rel);
  const commands = new Set();
  for (const run of extractRunBlocks(source)) {
    for (const label of detectExecutableShell(run)) commands.add(label);
  }
  return {
    source,
    events: parseOnEvents(source),
    commands: [...commands],
    localUses: extractLocalUses(source),
  };
}

function collectIndirectCommands(rel, seen = new Set()) {
  if (seen.has(rel)) return [];
  seen.add(rel);
  const info = yamlInfo(rel);
  const labels = new Set(info.commands);
  for (const usePath of info.localUses) {
    const resolved = resolveLocalUse(usePath);
    if (!resolved || !/\.ya?ml$/i.test(resolved)) continue;
    for (const label of collectIndirectCommands(resolved, seen)) labels.add(label);
  }
  return [...labels];
}

// Self-tests: text mentions must not fail; executable paths must fail.
const selfTests = [
  [detectExecutableShell('echo "EAS build is manual"').length === 0, 'echo mention is not execution'],
  [detectExecutableShell('npx eas update --channel preview').includes('eas update'), 'eas update is detected'],
  [detectExecutableShell('powershell.exe -File .\\BUILD_ANDROID.ps1 -Profile production').includes('manual build/submit entrypoint'), 'manual build wrapper is detected when invoked'],
  [extractRunBlocks('steps:\n  - run: npx eas build --platform android').length === 1, '- run: syntax is recognized'],
  [extractLocalUses('steps:\n  - uses: ./.github/actions/release').length === 1, '- uses: syntax is recognized'],
  [detectExecutableJavaScript('const { exec } = require("node:child_process"); exec("npx eas submit --platform android");').includes('eas submit'), 'JS process runner is detected'],
];
for (const [ok, label] of selfTests) {
  if (!ok) fail(`self-test failed: ${label}`);
}

const easWorkflows = listFilesRecursive('.eas/workflows', (file) => /\.ya?ml$/i.test(file));
for (const rel of easWorkflows) {
  const info = yamlInfo(rel);
  const automatic = [...info.events].filter((event) => automaticTriggers.has(event));
  if (automatic.length > 0) fail(`${rel}: automatic EAS Workflow trigger detected (${automatic.join(', ')}).`);
}

const githubWorkflows = listFilesRecursive('.github/workflows', (file) => /\.ya?ml$/i.test(file));
for (const rel of githubWorkflows) {
  const info = yamlInfo(rel);
  const automatic = [...info.events].filter((event) => automaticTriggers.has(event));
  const commands = collectIndirectCommands(rel);
  if (commands.length === 0) continue;
  if (automatic.length > 0) fail(`${rel}: automatic GitHub workflow reaches publish/build/submit (${commands.join(', ')}).`);
  const onlyManual = info.events.size === 1 && info.events.has('workflow_dispatch');
  if (!onlyManual) fail(`${rel}: publish/build/submit is allowed only from workflow_dispatch-only workflows.`);
}

const localActions = listFilesRecursive('.github/actions', (file) => /(?:action\.)?ya?ml$/i.test(file));
for (const rel of localActions) {
  const commands = collectIndirectCommands(rel);
  if (commands.length > 0) fail(`${rel}: local action contains publish/build/submit behavior (${commands.join(', ')}). Keep publishing in the manual workflow itself.`);
}

for (const [name, command] of Object.entries(packageScripts)) {
  if (typeof command !== 'string' || !automaticNpmLifecycle.has(name)) continue;
  const labels = detectExecutableShell(command);
  if (labels.length > 0) fail(`package.json lifecycle script "${name}" reaches publish/build/submit (${labels.join(', ')}).`);
}

const hookFiles = listFilesRecursive('.husky', () => true);
for (const rel of hookFiles) {
  const labels = detectExecutableShell(read(rel));
  if (labels.length > 0) fail(`${rel}: git hook reaches publish/build/submit (${labels.join(', ')}).`);
}

const scriptFiles = listFilesRecursive('scripts', (file) => /\.(?:mjs|cjs|js|ts|sh|ps1|cmd|bat)$/i.test(file));
for (const rel of scriptFiles) {
  if (rel === 'scripts/check-ci-policy.mjs') continue;
  const source = read(rel);
  const labels = /\.(?:mjs|cjs|js|ts)$/i.test(rel)
    ? detectExecutableJavaScript(source)
    : detectExecutableShell(source);
  if (labels.length > 0) fail(`${rel}: automation script executes publish/build/submit behavior (${labels.join(', ')}).`);
}

if (failures.length > 0) {
  console.error('CI POLICY FAIL:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`CI POLICY OK: ${easWorkflows.length} EAS workflow(s), ${githubWorkflows.length} GitHub workflow(s), ${localActions.length} local action YAML(s), ${hookFiles.length} hook file(s), ${scriptFiles.length} scripts checked. Normal push cannot publish/build/submit.`);
