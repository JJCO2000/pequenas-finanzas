import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import type { AgeBand } from '@/core/domain/types';
import { useAppData } from '@/features/session/AppDataProvider';
import { ACTIVE_THEME } from '@/core/theme';
import { WorldScene } from '@/features/shell/world';
import { ActionPill, FloatingCard } from '@/features/shell/gameui';
import { colors, radii, shadows } from '@/core/theme/tokens';

type Stage = 'cover' | 'profile';

export default function Onboarding() {
  const [stage, setStage] = useState<Stage>('cover');
  const [name, setName] = useState('');
  const [age, setAge] = useState<AgeBand>('6-8');
  const [busy, setBusy] = useState(false);
  const { createChildProfile } = useAppData();

  const go = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    try { await createChildProfile(name.trim(), age); router.replace('/play' as any); }
    finally { setBusy(false); }
  };

  if (stage === 'cover') {
    return (
      <WorldScene background={ACTIVE_THEME.world.onboarding} tone="none" safe={false} contentStyle={styles.root}>
        <Image source={ACTIVE_THEME.characters.startCast[0]!} style={[styles.coverCharacter, styles.castA]} resizeMode="contain" />
        <Image source={ACTIVE_THEME.characters.startCast[1]!} style={[styles.coverCharacter, styles.castB]} resizeMode="contain" />
        <Image source={ACTIVE_THEME.characters.startCast[2]!} style={[styles.coverCharacter, styles.castC]} resizeMode="contain" />
        <Image source={ACTIVE_THEME.characters.startCast[3]!} style={[styles.coverCharacter, styles.castD]} resizeMode="contain" />
        <View style={styles.coverCenter}>
          <View style={styles.logoPill}><Text style={styles.coverTitle}>Pequeñas Finanzas</Text><Text style={styles.coverSub}>Aprende jugando en una aventura prehistórica.</Text></View>
          <ActionPill label="JUGAR  →" onPress={() => setStage('profile')} style={styles.startButton} />
        </View>
      </WorldScene>
    );
  }

  return (
    <WorldScene background={ACTIVE_THEME.world.onboarding} tone="none" safe={false} contentStyle={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <Image source={ACTIVE_THEME.characters.onboardingProfile[0]!} style={styles.profileCharacterA} resizeMode="contain" />
        <Image source={ACTIVE_THEME.characters.onboardingProfile[1]!} style={styles.profileCharacterB} resizeMode="contain" />
        <FloatingCard style={styles.form}>
          <Text style={styles.formKicker}>NUEVO EXPLORADOR</Text>
          <Text style={styles.formTitle}>¿Cómo te llamas?</Text>
          <TextInput value={name} onChangeText={setName} maxLength={24} autoCorrect={false} autoCapitalize="words" placeholder="Tu nombre" placeholderTextColor={colors.inkMuted} style={styles.input} returnKeyType="done" />
          <View style={styles.ageRow}>
            {(['6-8', '9-12'] as AgeBand[]).map((band) => <Pressable key={band} onPress={() => setAge(band)} style={[styles.ageCard, age === band && styles.ageActive]}><Text style={[styles.ageText, age === band && styles.ageTextActive]}>{band} años</Text></Pressable>)}
          </View>
          <ActionPill label={busy ? 'PREPARANDO…' : 'ENTRAR AL MAPA  →'} onPress={() => void go()} style={styles.continue} />
        </FloatingCard>
      </KeyboardAvoidingView>
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  coverCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 3 },
  logoPill: { alignItems: 'center', backgroundColor: 'rgba(4,54,36,0.72)', borderRadius: 22, paddingHorizontal: 22, paddingVertical: 10 },
  coverTitle: { color: colors.white, fontSize: 28, lineHeight: 30, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 1 },
  coverSub: { color: '#DDEED8', fontSize: 7, lineHeight: 9, fontWeight: '700', marginTop: 2 },
  startButton: { marginTop: 10, minWidth: 130 },
  coverCharacter: { position: 'absolute', zIndex: 2 },
  castA: { width: 112, height: 100, left: 0, top: -4 },
  castB: { width: 128, height: 154, left: 22, bottom: -36 },
  castC: { width: 138, height: 112, right: 0, top: -4 },
  castD: { width: 164, height: 98, right: 0, bottom: -5 },
  form: { width: '46%', minWidth: 380, maxWidth: 500, alignSelf: 'center', marginTop: '13%', padding: 12, alignItems: 'center', zIndex: 4 },
  formKicker: { color: colors.orange, fontSize: 5.5, fontWeight: '900', letterSpacing: 0.8 },
  formTitle: { color: colors.forestDark, fontSize: 15, lineHeight: 17, fontWeight: '900', marginTop: 2 },
  input: { width: '82%', height: 34, borderRadius: 17, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#B9CFB0', color: colors.ink, fontSize: 10, fontWeight: '900', textAlign: 'center', paddingHorizontal: 14, marginTop: 8 },
  ageRow: { flexDirection: 'row', gap: 7, marginTop: 7 },
  ageCard: { minWidth: 86, height: 30, borderRadius: 15, backgroundColor: '#EEF6E8', borderWidth: 1.5, borderColor: '#D7E6CF', alignItems: 'center', justifyContent: 'center' },
  ageActive: { backgroundColor: colors.forest, borderColor: '#FFD54F' },
  ageText: { color: colors.forestDark, fontSize: 7, fontWeight: '900' },
  ageTextActive: { color: colors.white },
  continue: { marginTop: 8, minWidth: 150 },
  profileCharacterA: { position: 'absolute', left: 12, bottom: -16, width: 160, height: 110 },
  profileCharacterB: { position: 'absolute', right: 18, top: 0, width: 130, height: 142 },
});
