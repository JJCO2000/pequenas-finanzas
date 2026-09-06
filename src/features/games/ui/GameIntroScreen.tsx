import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { ActionPill, FloatingCard, HudPill, IconButton } from '@/features/shell/gameui';
import { colors, radii, shadows } from '@/core/theme/tokens';

export function GameIntroScreen({ badge, title, description, learningObjective, financialConcept, durationSeconds, controls, hero, introSteps, modeLabel, onBack, onStart }: {
  badge: string; title: string; description: string; learningObjective: string; financialConcept: string; durationSeconds: number; controls: string[]; hero: ImageSourcePropType; introSteps: [string, string, string]; modeLabel: string; onBack: () => void; onStart: () => void;
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
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.title}>{title}</Text>
        <Text numberOfLines={2} style={styles.description}>{description}</Text>
        <View style={styles.steps}>
          {introSteps.map((step, index) => (
            <FloatingCard key={`${index}-${step}`} style={styles.step}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View>
              <Text numberOfLines={2} adjustsFontSizeToFit style={styles.stepText}>{step}</Text>
            </FloatingCard>
          ))}
        </View>
        <View style={styles.learningLine}>
          <Text style={styles.learningLabel}>{financialConcept.toUpperCase()}</Text>
          <Text numberOfLines={2} style={styles.learningText}>{learningObjective}</Text>
        </View>
        <View style={styles.footerRow}>
          <Text numberOfLines={1} style={styles.controls}>{controls.join(' · ').toUpperCase()}</Text>
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
  root: { flex: 1, minHeight: 0, position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 58, paddingVertical: 18 },
  topLeft: { position: 'absolute', left: 12, top: 10, zIndex: 20 },
  topRight: { position: 'absolute', right: 12, top: 10, zIndex: 20 },
  heroZone: { width: '33%', maxWidth: 300, minWidth: 190, alignItems: 'center', justifyContent: 'center' },
  mode: { borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(255,253,243,0.91)', borderWidth: 1, borderColor: '#DCE8D0', marginBottom: 7 },
  modeText: { color: colors.forestDark, fontSize: 7.5, fontWeight: '900', letterSpacing: 0.7 },
  heroHalo: { width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(225,244,211,0.88)', borderWidth: 2, borderColor: '#A8D79F', alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  hero: { width: 145, height: 137 },
  copyZone: { width: '48%', maxWidth: 560, minWidth: 360, justifyContent: 'center' },
  title: { color: colors.white, fontSize: 21, lineHeight: 24, fontWeight: '900', textShadowColor: colors.glassBlack, textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 2 },
  description: { color: '#F7F7E9', fontSize: 8.5, lineHeight: 11, fontWeight: '800', marginTop: 3, maxWidth: 480 },
  steps: { flexDirection: 'row', gap: 6, marginTop: 8 },
  step: { flex: 1, minHeight: 54, padding: 7, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,253,243,0.93)' },
  stepNumber: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: colors.forestDark, fontSize: 8, fontWeight: '900' },
  stepText: { flex: 1, color: colors.forestDark, fontSize: 7.2, lineHeight: 9, fontWeight: '800' },
  learningLine: { marginTop: 7, borderRadius: 12, backgroundColor: 'rgba(7,79,54,0.90)', paddingHorizontal: 9, paddingVertical: 6 },
  learningLabel: { color: colors.gold, fontSize: 6.5, fontWeight: '900', letterSpacing: 0.8 },
  learningText: { color: colors.white, fontSize: 7.5, lineHeight: 10, fontWeight: '700', marginTop: 1 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 7 },
  controls: { flex: 1, minWidth: 0, color: '#F0F5EA', fontSize: 7, fontWeight: '900', letterSpacing: 0.4 },
  peekWrap: { position: 'relative', alignItems: 'flex-end' },
  peekButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(4,68,47,0.94)', borderWidth: 1.5, borderColor: '#82C77A', alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  peekButtonOpen: { backgroundColor: colors.orange },
  peekButtonText: { color: colors.white, fontSize: 17, lineHeight: 19, fontWeight: '900' },
  peekPanel: { position: 'absolute', zIndex: 40, right: 0, top: 38, width: 230, padding: 8 },
  peekKicker: { color: colors.orange, fontSize: 6.5, fontWeight: '900', letterSpacing: 0.6 },
  peekText: { color: colors.forestDark, fontSize: 7.5, lineHeight: 10, fontWeight: '700', marginTop: 3 },
  pressed: { transform: [{ scale: 0.97 }] },
});
