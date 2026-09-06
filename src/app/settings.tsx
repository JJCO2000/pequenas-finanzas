import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppData } from '@/features/session/AppDataProvider';
import { ACTIVE_THEME } from '@/core/theme';
import { useCampBack } from '@/features/shell/navigation/useCampBack';
import { WorldScene } from '@/features/shell/world';
import { CompactHeader, FloatingCard } from '@/features/shell/gameui';
import { colors, shadows, typography } from '@/core/theme/tokens';

export default function SettingsScreen() {
  const { settings, updateSetting } = useAppData();
  const { goBack } = useCampBack();
  const sound = settings.sound !== 'off';
  const haptics = settings.haptics !== 'off';

  return (
    <WorldScene background={ACTIVE_THEME.world.shell} tone="none" contentStyle={styles.root}>
      <CompactHeader eyebrow="AJUSTES" title="Cabina" subtitle="Sonido y vibración." hero={ACTIVE_THEME.characters.primary} onBack={goBack} />
      <View style={styles.center}>
        <SettingButton title="Sonido" description="Música y efectos" value={sound} art={ACTIVE_THEME.characters.quaternary} tone="#DDF4FA" onPress={() => void updateSetting('sound', sound ? 'off' : 'on')} />
        <SettingButton title="Vibración" description="Respuesta al tocar" value={haptics} art={ACTIVE_THEME.coinCatcherArt?.coin ?? ACTIVE_THEME.decor.currency} tone="#FFF1BA" onPress={() => void updateSetting('haptics', haptics ? 'off' : 'on')} />
      </View>
      <FloatingCard style={styles.note}>
        <Image source={ACTIVE_THEME.decor.savings} style={styles.noteArt} resizeMode="contain" />
        <View style={styles.noteCopy}><Text style={styles.noteTitle}>Guardado local</Text><Text numberOfLines={2} style={styles.noteText}>Tu progreso, compras e inversiones no cambian al ajustar estas opciones.</Text></View>
      </FloatingCard>
    </WorldScene>
  );
}

function SettingButton({ title, description, value, art, tone, onPress }: { title: string; description: string; value: boolean; art: any; tone: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} onPress={onPress} style={({ pressed }) => [styles.setting, { backgroundColor: tone }, value && styles.settingActive, pressed && styles.pressed]}>
      <Image source={art} style={styles.settingArt} resizeMode="contain" />
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.settingDesc}>{description}</Text>
      <View style={[styles.switch, value && styles.switchOn]}><View style={[styles.knob, value && styles.knobOn]} /></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 10, paddingVertical: 8 },
  center: { flex: 1, minHeight: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, paddingBottom: 76 },
  setting: { width: 160, height: 150, borderRadius: 22, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center', ...shadows.card },
  settingActive: { borderColor: '#FFD54F' },
  settingArt: { width: 58, height: 52 },
  settingTitle: { color: colors.forestDark, fontSize: 14, lineHeight: 16, fontWeight: '900', marginTop: 3 },
  settingDesc: { color: colors.inkMuted, fontSize: typography.caption, lineHeight: 13, fontWeight: '700', marginTop: 2 },
  switch: { width: 46, height: 24, borderRadius: 12, backgroundColor: '#B8C2BB', padding: 3, marginTop: 7 },
  switchOn: { backgroundColor: colors.forest },
  knob: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.white },
  knobOn: { alignSelf: 'flex-end' },
  note: { position: 'absolute', left: '22%', right: '22%', bottom: 10, minHeight: 62, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 8 },
  noteArt: { width: 44, height: 42 },
  noteCopy: { flex: 1, minWidth: 0 },
  noteTitle: { color: colors.forestDark, fontSize: typography.label, lineHeight: 14, fontWeight: '900' },
  noteText: { color: colors.inkMuted, fontSize: typography.micro, lineHeight: 12, fontWeight: '700', marginTop: 2 },
  pressed: { transform: [{ scale: 0.97 }] },
});
