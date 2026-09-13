import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { useAppData } from '@/features/session/AppDataProvider';
import { ACTIVE_THEME } from '@/core/theme';
import { useCampBack } from '@/features/shell/navigation/useCampBack';
import { WorldScene } from '@/features/shell/world';
import { CompactHeader, FloatingCard } from '@/features/shell/gameui';
import { colors, shadows } from '@/core/theme/tokens';

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

function SettingButton({ title, description, value, art, tone, onPress }: { title: string; description: string; value: boolean; art: ImageSourcePropType; tone: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityLabel={title} accessibilityHint={description} accessibilityState={{ checked: value }} onPress={onPress} style={({ pressed }) => [styles.setting, { backgroundColor: tone }, value && styles.settingActive, pressed && styles.pressed]}>
      <Image source={art} style={styles.settingArt} resizeMode="contain" />
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.settingDesc}>{description}</Text>
      <View pointerEvents="none" style={[styles.switch, value && styles.switchOn]}><View style={[styles.knob, value && styles.knobOn]} /></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 10, paddingVertical: 8 },
  center: { flex: 1, minHeight: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, paddingBottom: 66 },
  setting: { width: 150, height: 138, borderRadius: 22, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center', ...shadows.card },
  settingActive: { borderColor: '#FFD54F' },
  settingArt: { width: 58, height: 52 },
  settingTitle: { color: colors.forestDark, fontSize: 11, lineHeight: 13, fontWeight: '900', marginTop: 2 },
  settingDesc: { color: colors.inkMuted, fontSize: 6, fontWeight: '700', marginTop: 1 },
  switch: { width: 42, height: 22, borderRadius: 11, backgroundColor: '#B8C2BB', padding: 2.5, marginTop: 6 },
  switchOn: { backgroundColor: colors.forest },
  knob: { width: 17, height: 17, borderRadius: 9, backgroundColor: colors.white },
  knobOn: { alignSelf: 'flex-end' },
  note: { position: 'absolute', left: '24%', right: '24%', bottom: 10, minHeight: 52, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 7 },
  noteArt: { width: 42, height: 40 },
  noteCopy: { flex: 1, minWidth: 0 },
  noteTitle: { color: colors.forestDark, fontSize: 8.5, fontWeight: '900' },
  noteText: { color: colors.inkMuted, fontSize: 5.7, lineHeight: 7, fontWeight: '700', marginTop: 1 },
  pressed: { transform: [{ scale: 0.97 }] },
});
