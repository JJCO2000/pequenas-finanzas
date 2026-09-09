import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { LessonOption } from '@/content/curriculum/levels';
import { colors, radii, shadows } from '@/core/theme/tokens';

type QuizFeedback = { correct: boolean } | null;

export function DecisionQuiz({
  situation,
  options,
  explanation,
  onComplete,
}: {
  situation: string;
  options: LessonOption[];
  explanation?: string;
  onComplete: (score: number) => Promise<void> | void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<QuizFeedback>(null);

  const choose = (optionId: string) => {
    if (busy) return;
    setSelected(optionId);
    setFeedback(null);
  };

  const check = async () => {
    if (!selected || busy) return;
    const correct = options.find((option) => option.id === selected)?.correct === true;

    // Feedback belongs to the quiz itself so the learner sees a result immediately,
    // before persistence/rewards/overlays finish their async work.
    setFeedback({ correct });
    setBusy(true);
    try {
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
          const selectedCorrect = active && feedback?.correct === true;
          const selectedIncorrect = active && feedback?.correct === false;
          return (
            <Pressable
              key={option.id}
              disabled={busy}
              onPress={() => choose(option.id)}
              style={({ pressed }) => [
                styles.option,
                index % 2 === 1 && styles.optionAlt,
                active && styles.optionActive,
                selectedCorrect && styles.optionCorrect,
                selectedIncorrect && styles.optionIncorrect,
                pressed && !busy && styles.optionPressed,
              ]}
            >
              <View style={[
                styles.optionIndex,
                active && styles.optionIndexActive,
                selectedCorrect && styles.optionIndexCorrect,
                selectedIncorrect && styles.optionIndexIncorrect,
              ]}>
                <Text style={[styles.optionIndexText, active && styles.optionIndexTextActive]}>{index + 1}</Text>
              </View>
              <Text numberOfLines={3} adjustsFontSizeToFit style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {feedback ? (
        <View style={[styles.feedback, feedback.correct ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
          <Text style={[styles.feedbackTitle, feedback.correct ? styles.feedbackTitleCorrect : styles.feedbackTitleIncorrect]}>
            {feedback.correct ? '✓ ¡Correcto!' : '✕ Aún no'}
          </Text>
          <Text accessibilityLiveRegion="polite" numberOfLines={2} adjustsFontSizeToFit style={styles.feedbackText}>
            {feedback.correct
              ? (explanation ?? 'Esa decisión aplica correctamente la idea del reto.')
              : (explanation ? `${explanation} Prueba otra opción.` : 'Revisa las opciones y prueba otra vez.')}
          </Text>
        </View>
      ) : null}

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
  optionCorrect: { backgroundColor: '#DDF4D9', borderColor: '#4B9B62' },
  optionIncorrect: { backgroundColor: '#FFE2D7', borderColor: '#D87555' },
  optionPressed: { transform: [{ scale: 0.98 }] },
  optionIndex: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#DDEED4', alignItems: 'center', justifyContent: 'center' },
  optionIndexActive: { backgroundColor: '#0B5C40' },
  optionIndexCorrect: { backgroundColor: '#317747' },
  optionIndexIncorrect: { backgroundColor: '#B55239' },
  optionIndexText: { color: '#0B5C40', fontSize: 7.5, fontWeight: '900' },
  optionIndexTextActive: { color: colors.white },
  optionText: { flex: 1, color: colors.forestDark, fontSize: 7.5, lineHeight: 9.5, fontWeight: '800', textAlign: 'left' },
  optionTextActive: { color: colors.forestDark },
  feedback: { alignSelf: 'center', width: '68%', minHeight: 30, maxHeight: 44, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 5, justifyContent: 'center', ...shadows.soft },
  feedbackCorrect: { backgroundColor: 'rgba(231,248,225,0.98)', borderColor: '#66A873' },
  feedbackIncorrect: { backgroundColor: 'rgba(255,235,224,0.98)', borderColor: '#D98969' },
  feedbackTitle: { fontSize: 8, lineHeight: 10, fontWeight: '900', marginBottom: 1 },
  feedbackTitleCorrect: { color: '#28633A' },
  feedbackTitleIncorrect: { color: '#A44833' },
  feedbackText: { color: colors.forestDark, fontSize: 6.8, lineHeight: 8.5, fontWeight: '700' },
  check: { alignSelf: 'center', minWidth: 126, minHeight: 30, borderRadius: radii.pill, backgroundColor: colors.gold, borderWidth: 1.5, borderColor: '#FFF1AE', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, ...shadows.soft },
  checkDisabled: { opacity: 0.38 },
  checkText: { color: colors.forestDark, fontSize: 7.5, fontWeight: '900', letterSpacing: 0.7 },
});
