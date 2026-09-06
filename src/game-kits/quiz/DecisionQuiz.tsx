import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { LessonOption } from '@/content/curriculum/levels';
import { colors, radii, shadows } from '@/core/theme/tokens';

export function DecisionQuiz({
  situation,
  options,
  onComplete,
}: {
  situation: string;
  options: LessonOption[];
  onComplete: (score: number) => Promise<void> | void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const check = async () => {
    if (!selected || busy) return;
    setBusy(true);
    try {
      const correct = options.find((option) => option.id === selected)?.correct === true;
      await onComplete(correct ? 100 : 0);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.situationBox}>
        <Text style={styles.situationLabel}>SITUACIÓN</Text>
        <Text numberOfLines={3} adjustsFontSizeToFit style={styles.situation}>{situation}</Text>
      </View>
      <View style={styles.optionsGrid}>
        {options.map((option, index) => {
          const active = selected === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => setSelected(option.id)}
              style={({ pressed }) => [
                styles.option,
                index % 2 === 1 && styles.optionAlt,
                active && styles.optionActive,
                pressed && styles.optionPressed,
              ]}
            >
              <View style={[styles.optionIndex, active && styles.optionIndexActive]}>
                <Text style={[styles.optionIndexText, active && styles.optionIndexTextActive]}>{index + 1}</Text>
              </View>
              <Text numberOfLines={3} adjustsFontSizeToFit style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        disabled={!selected || busy}
        onPress={() => void check()}
        style={({ pressed }) => [styles.check, (!selected || busy) && styles.checkDisabled, pressed && selected && !busy && styles.optionPressed]}
      >
        <Text style={styles.checkText}>{busy ? 'REVISANDO…' : 'COMPROBAR'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 0, gap: 6, justifyContent: 'center' },
  situationBox: { alignSelf: 'center', width: '68%', minHeight: 48, maxHeight: 66, borderRadius: 14, backgroundColor: 'rgba(250,247,225,0.95)', borderWidth: 1.5, borderColor: '#B9D69F', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 6, ...shadows.soft },
  situationLabel: { color: colors.orange, fontSize: 6.5, fontWeight: '900', letterSpacing: 1.1, marginBottom: 2 },
  situation: { color: colors.forestDark, fontSize: 10, lineHeight: 13, fontWeight: '900', textAlign: 'center' },
  optionsGrid: { alignSelf: 'center', width: '78%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  option: { width: '31%', minHeight: 40, maxHeight: 50, borderRadius: 13, borderWidth: 1.5, borderColor: '#9CC587', backgroundColor: 'rgba(255,253,243,0.95)', paddingHorizontal: 7, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 5, ...shadows.soft },
  optionAlt: { backgroundColor: 'rgba(240,249,233,0.96)' },
  optionActive: { backgroundColor: '#FFE38A', borderColor: '#F5B83A' },
  optionPressed: { transform: [{ scale: 0.98 }] },
  optionIndex: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#DDEED4', alignItems: 'center', justifyContent: 'center' },
  optionIndexActive: { backgroundColor: '#0B5C40' },
  optionIndexText: { color: '#0B5C40', fontSize: 7.5, fontWeight: '900' },
  optionIndexTextActive: { color: colors.white },
  optionText: { flex: 1, color: colors.forestDark, fontSize: 7.5, lineHeight: 9.5, fontWeight: '800', textAlign: 'left' },
  optionTextActive: { color: colors.forestDark },
  check: { alignSelf: 'center', minWidth: 126, minHeight: 30, borderRadius: radii.pill, backgroundColor: colors.gold, borderWidth: 1.5, borderColor: '#FFF1AE', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, ...shadows.soft },
  checkDisabled: { opacity: 0.38 },
  checkText: { color: colors.forestDark, fontSize: 7.5, fontWeight: '900', letterSpacing: 0.7 },
});
