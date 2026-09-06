import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, shadows } from '@/core/theme/tokens';

export function WorldPanel({ children, tone = 'cream', style }: { children: React.ReactNode; tone?: 'cream' | 'forest' | 'glass' | 'gold'; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.panel, tone === 'forest' && styles.panelForest, tone === 'glass' && styles.panelGlass, tone === 'gold' && styles.panelGold, style]}>
    <View pointerEvents="none" style={styles.panelHighlight} />{children}
  </View>;
}

export function WorldButton({ label, onPress, disabled = false, compact = false, style }: { label: string; onPress: () => void; disabled?: boolean; compact?: boolean; style?: StyleProp<ViewStyle> }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, compact && styles.buttonCompact, style, disabled && styles.disabled, pressed && !disabled && styles.pressed]}>
    <View pointerEvents="none" style={styles.buttonShine} /><Text numberOfLines={1} adjustsFontSizeToFit style={styles.buttonText}>{label}</Text>
  </Pressable>;
}

export function WorldCircleButton({ label, accessibilityLabel, onPress, size = 36 }: { label: string; accessibilityLabel: string; onPress: () => void; size?: number }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={({ pressed }) => [styles.circle, { width: size, height: size, borderRadius: size / 2 }, pressed && styles.pressed]}>
    <Text style={[styles.circleText, { fontSize: Math.round(size * 0.43) }]}>{label}</Text>
  </Pressable>;
}

export function WorldHeader({ title, subtitle, eyebrow, hero, onBack, right, style }: {
  title: string; subtitle?: string; eyebrow?: string; hero?: ImageSourcePropType; onBack?: () => void; right?: React.ReactNode; style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.headerRow, style]}>
    {onBack ? <WorldCircleButton label="←" accessibilityLabel="Volver" onPress={onBack} /> : null}
    <WorldPanel tone="forest" style={styles.headerPanel}>
      {hero ? <Image source={hero} resizeMode="contain" style={styles.headerHero} /> : null}
      <View style={styles.headerCopy}>
        {eyebrow ? <Text numberOfLines={1} style={styles.headerEyebrow}>{eyebrow}</Text> : null}
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text numberOfLines={1} style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
    </WorldPanel>{right}
  </View>;
}

export function WorldStat({ label, value, icon, tone = 'cream', style }: { label: string; value: string | number; icon?: string; tone?: 'cream' | 'forest' | 'gold' | 'orange'; style?: StyleProp<ViewStyle> }) {
  return <WorldPanel tone={tone === 'forest' ? 'forest' : tone === 'gold' ? 'gold' : 'cream'} style={[styles.stat, tone === 'orange' && styles.statOrange, style]}>
    {icon ? <Text style={styles.statIcon}>{icon}</Text> : null}<View style={styles.statCopy}>
      <Text numberOfLines={1} style={[styles.statLabel, tone === 'forest' && styles.statLight]}>{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.statValue, tone === 'forest' && styles.statValueLight]}>{value}</Text>
    </View>
  </WorldPanel>;
}

export function WorldSectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={styles.sectionTitle}><Text style={styles.sectionTitleText}>{title}</Text>{subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}</View>;
}

const styles = StyleSheet.create({
  panel: { position: 'relative', overflow: 'hidden', borderRadius: 16, backgroundColor: '#FFFDF3', borderWidth: 1, borderColor: '#DDE6CB', ...shadows.card },
  panelForest: { backgroundColor: 'rgba(5, 75, 51, 0.97)', borderColor: '#55A56B' },
  panelGlass: { backgroundColor: 'rgba(255, 253, 243, 0.92)', borderColor: 'rgba(255,255,255,0.96)' },
  panelGold: { backgroundColor: '#FFF2B2', borderColor: '#FFD34E' },
  panelHighlight: { position: 'absolute', left: 14, right: 14, top: 3, height: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.72)' },
  button: { minHeight: 34, borderRadius: radii.pill, backgroundColor: '#FFD54F', borderWidth: 2, borderColor: '#FFF4B4', paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...shadows.card },
  buttonCompact: { minHeight: 30, paddingHorizontal: 11 },
  buttonShine: { position: 'absolute', left: 18, right: 18, top: 4, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.74)' },
  buttonText: { color: '#083E2C', fontSize: 9, lineHeight: 11, fontWeight: '900' },
  circle: { backgroundColor: 'rgba(4, 68, 47, 0.97)', borderWidth: 2, borderColor: '#8BCA82', alignItems: 'center', justifyContent: 'center', ...shadows.card },
  circleText: { color: colors.white, lineHeight: 28, fontWeight: '900' },
  disabled: { opacity: 0.42 }, pressed: { transform: [{ scale: 0.965 }] },
  headerRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 7 },
  headerPanel: { flex: 1, minWidth: 0, minHeight: 40, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 15 },
  headerHero: { width: 32, height: 32, marginRight: 7 }, headerCopy: { flex: 1, minWidth: 0 },
  headerEyebrow: { color: '#FFD34E', fontSize: 7, lineHeight: 9, fontWeight: '900', letterSpacing: 0.9 },
  headerTitle: { color: colors.white, fontSize: 15, lineHeight: 17, fontWeight: '900' },
  headerSubtitle: { color: '#DDEFD8', fontSize: 7, lineHeight: 9, fontWeight: '700', marginTop: 1 },
  stat: { minWidth: 78, minHeight: 38, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 7 },
  statOrange: { backgroundColor: '#FFE5CF', borderColor: '#FFB37B' }, statIcon: { color: '#0A5D40', fontSize: 17, fontWeight: '900' }, statCopy: { flex: 1, minWidth: 0 },
  statLabel: { color: '#66756C', fontSize: 6.5, lineHeight: 8, fontWeight: '900' }, statValue: { color: '#0B4D37', fontSize: 14, lineHeight: 16, fontWeight: '900' },
  statLight: { color: '#DDEFD8' }, statValueLight: { color: '#FFF7C7' },
  sectionTitle: { gap: 1 }, sectionTitleText: { color: '#0B4D37', fontSize: 14, lineHeight: 16, fontWeight: '900' }, sectionSubtitle: { color: '#66756C', fontSize: 9, lineHeight: 12, fontWeight: '700' },
});
