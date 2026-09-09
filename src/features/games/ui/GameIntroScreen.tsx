import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { ActionPill, FloatingCard, HudPill, IconButton } from '@/features/shell/gameui';
import { colors, radii, shadows, typography } from '@/core/theme/tokens';

export function GameIntroScreen({ badge, title, description, learningObjective, financialConcept, durationSeconds, controls, hero, introSteps, modeLabel, activePowerLabels = [], onBack, onStart }: {
  badge: string;
  title: string;
  description: string;
  learningObjective: string;
  financialConcept: string;
  durationSeconds: number;
  controls: string[];
  hero: ImageSourcePropType;
  introSteps: [string, string, string];
  modeLabel: string;
  activePowerLabels?: string[];
  onBack: () => void;
  onStart: () => void;
}) {
  return (
    <View style={styles.root}>
      <View style={styles.topLeft}><IconButton label="←" accessibilityLabel="Volver" onPress={onBack} /></View>
      <View style={styles.topRight}><HudPill label={badge} value={`~${durationSeconds}s`} /></View>

      <View style={styles.heroZone}>
        <View style={styles.mode}><Text style={styles.modeText}>{modeLabel}</Text></View>
        <View style={styles.heroHalo}><Image source={hero} resizeMode="contain" style={styles.hero} /></View>
      </View>

      <View style={styles.copyZone}>
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={styles.title}>{title}</Text>
        <Text numberOfLines={2} style={styles.description}>{description}</Text>
        {activePowerLabels.length > 0 ? (
          <View style={styles.powerStrip}>
            <Text style={styles.powerKicker}>PODERES ACTIVOS</Text>
            <View style={styles.powerPills}>
              {activePowerLabels.map((label) => (
                <View key={label} style={styles.powerPill}>
                  <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78} style={styles.powerText}>✓ {label}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
        <View style={styles.steps}>
          {introSteps.map((step, index) => (
            <FloatingCard key={`${index}-${step}`} style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View>
              <Text numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.9} style={styles.stepText}>{step}</Text>
            </FloatingCard>
          ))}
        </View>
        <View style={styles.learningLine}>
          <Text style={styles.learningLabel}>{financialConcept.toUpperCase()}</Text>
          <Text numberOfLines={2} style={styles.learningText}>{learningObjective}</Text>
        </View>
        <View style={styles.footerRow}>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9} style={styles.controls}>{controls.join(' · ').toUpperCase()}</Text>
          <ActionPill label="Jugar ahora →" onPress={onStart} />
        </View>
      </View>
    </View>
  );
}

export function LearningPeek({ open, onToggle, learningObjective, financialConcept }: { open: boolean; onToggle: () => void; learningObjective: string; financialConcept: string }) {
  return (
    <View pointerEvents="box-none" style={styles.peekWrap}>
      <Pressable accessibilityRole="button" accessibilityLabel={open ? 'Ocultar aprendizaje' : 'Mostrar aprendizaje'} onPress={onToggle} style={({ pressed }) => [styles.peekButton, open && styles.peekButtonOpen, pressed && styles.pressed]}>
        <Text style={styles.peekButtonText}>{open ? '×' : '?'}</Text>
      </Pressable>
      {open ? (
        <FloatingCard style={styles.peekPanel}>
          <Text style={styles.peekKicker}>{financialConcept.toUpperCase()}</Text>
          <Text numberOfLines={4} style={styles.peekText}>{learningObjective}</Text>
        </FloatingCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 0, position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 58, paddingVertical: 12 },
  topLeft: { position: 'absolute', left: 12, top: 10, zIndex: 20 },
  topRight: { position: 'absolute', right: 12, top: 10, zIndex: 20 },
  heroZone: { width: '33%', maxWidth: 300, minWidth: 190, alignItems: 'center', justifyContent: 'center' },
  mode: { borderRadius: radii.pill, paddingHorizontal: 11, paddingVertical: 5, backgroundColor: 'rgba(255,253,243,0.91)', borderWidth: 1, borderColor: '#DCE8D0', marginBottom: 7 },
  modeText: { color: colors.forestDark, fontSize: typography.micro, lineHeight: 12, fontWeight: '900', letterSpacing: 0.5 },
  heroHalo: { width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(225,244,211,0.88)', borderWidth: 2, borderColor: '#A8D79F', alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  hero: { width: 145, height: 137 },
  copyZone: { width: '50%', maxWidth: 580, minWidth: 360, justifyContent: 'center' },
  title: { color: colors.white, fontSize: 22, lineHeight: 25, fontWeight: '900', textShadowColor: colors.glassBlack, textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 2 },
  description: { color: '#F7F7E9', fontSize: typography.label, lineHeight: 15, fontWeight: '800', marginTop: 3, maxWidth: 500 },
  powerStrip: { marginTop: 6, borderRadius: 12, backgroundColor: 'rgba(255,240,168,0.95)', paddingHorizontal: 8, paddingVertical: 5 },
  powerKicker: { color: colors.forestDark, fontSize: typography.micro, lineHeight: 12, fontWeight: '900', letterSpacing: 0.5 },
  powerPills: { flexDirection: 'row', gap: 4, marginTop: 3 },
  powerPill: { flex: 1, minWidth: 0, minHeight: 22, borderRadius: radii.pill, backgroundColor: colors.forestDark, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  powerText: { color: colors.white, fontSize: typography.micro, lineHeight: 11, fontWeight: '900', textAlign: 'center' },
  steps: { flexDirection: 'row', gap: 6, marginTop: 7 },
  step: { flex: 1, minHeight: 58, padding: 7, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,253,243,0.93)' },
  stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: colors.forestDark, fontSize: typography.caption, fontWeight: '900' },
  stepText: { flex: 1, color: colors.forestDark, fontSize: typography.caption, lineHeight: 13, fontWeight: '800' },
  learningLine: { marginTop: 6, borderRadius: 12, backgroundColor: 'rgba(7,79,54,0.90)', paddingHorizontal: 10, paddingVertical: 6 },
  learningLabel: { color: colors.gold, fontSize: typography.micro, lineHeight: 12, fontWeight: '900', letterSpacing: 0.55 },
  learningText: { color: colors.white, fontSize: typography.caption, lineHeight: 14, fontWeight: '700', marginTop: 2 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 7 },
  controls: { flex: 1, minWidth: 0, color: '#F0F5EA', fontSize: typography.micro, lineHeight: 12, fontWeight: '900', letterSpacing: 0.3 },
  peekWrap: { position: 'relative', alignItems: 'flex-end' },
  peekButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(4,68,47,0.94)', borderWidth: 1.5, borderColor: '#82C77A', alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  peekButtonOpen: { backgroundColor: colors.orange },
  peekButtonText: { color: colors.white, fontSize: 18, lineHeight: 20, fontWeight: '900' },
  peekPanel: { position: 'absolute', zIndex: 40, right: 0, top: 42, width: 250, padding: 10 },
  peekKicker: { color: colors.orange, fontSize: typography.micro, lineHeight: 12, fontWeight: '900', letterSpacing: 0.5 },
  peekText: { color: colors.forestDark, fontSize: typography.caption, lineHeight: 14, fontWeight: '700', marginTop: 4 },
  pressed: { transform: [{ scale: 0.97 }] },
});
