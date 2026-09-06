import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ACTIVE_THEME } from '@/core/theme';
import { colors, radii, shadows, typography } from '@/core/theme/tokens';

export function ParentGate({ children }: { children: React.ReactNode }) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [wrong, setWrong] = useState(false);
  const a = 7; const b = 4;
  if (open) return <>{children}</>;

  const submit = () => {
    if (Number(input) === a * b) { setWrong(false); setOpen(true); return; }
    setWrong(true); setInput('');
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Image source={ACTIVE_THEME.decor.currency} style={styles.fossil} resizeMode="contain" />
        <View style={styles.copy}>
          <Text style={styles.kicker}>SOLO PARA ADULTOS</Text>
          <Text style={styles.title}>Zona de acompañamiento</Text>
          <Text style={styles.challenge}>{a} × {b} = ?</Text>
          <View style={styles.answerRow}>
            <TextInput
              accessibilityLabel="Respuesta del adulto"
              value={input}
              onChangeText={(value) => { setInput(value); setWrong(false); }}
              onSubmitEditing={submit}
              keyboardType="number-pad"
              returnKeyType="done"
              style={[styles.input, wrong && styles.inputWrong]}
              placeholder="Respuesta"
              placeholderTextColor={colors.inkMuted}
            />
            <Pressable accessibilityRole="button" onPress={submit} style={({ pressed }) => [styles.enter, pressed && styles.pressed]}><Text style={styles.enterText}>ENTRAR</Text></Pressable>
          </View>
          <Text style={[styles.helper, wrong && styles.wrong]}>{wrong ? 'Respuesta incorrecta.' : 'Evita accesos accidentales de niños.'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { width: '60%', minWidth: 430, maxWidth: 580, minHeight: 174, borderRadius: 22, backgroundColor: 'rgba(255,253,244,0.95)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.94)', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, ...shadows.card },
  fossil: { width: 96, height: 96 },
  copy: { flex: 1, minWidth: 0 },
  kicker: { color: colors.orange, fontSize: typography.micro, lineHeight: 12, fontWeight: '900', letterSpacing: 0.8 },
  title: { color: colors.forestDark, fontSize: 16, lineHeight: 18, fontWeight: '900', marginTop: 2 },
  challenge: { color: colors.forestDark, fontSize: 23, lineHeight: 25, fontWeight: '900', marginTop: 6 },
  answerRow: { flexDirection: 'row', gap: 7, marginTop: 7 },
  input: { flex: 1, minWidth: 0, height: 40, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#DDE5D1', color: colors.ink, fontSize: 14, fontWeight: '900', textAlign: 'center', paddingVertical: 0 },
  inputWrong: { borderColor: colors.danger },
  enter: { width: 102, height: 40, borderRadius: radii.pill, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  enterText: { color: colors.white, fontSize: typography.caption, lineHeight: 13, fontWeight: '900', letterSpacing: 0.7 },
  helper: { color: colors.inkMuted, fontSize: typography.micro, lineHeight: 12, fontWeight: '700', marginTop: 5 },
  wrong: { color: colors.danger },
  pressed: { transform: [{ scale: 0.97 }] },
});
