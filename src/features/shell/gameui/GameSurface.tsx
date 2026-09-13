import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { colors, radii, shadows } from '@/core/theme/tokens';

export function CompactHeader({
  title,
  subtitle,
  eyebrow,
  hero,
  onBack,
  right,
  style,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  hero?: ImageSourcePropType;
  onBack?: () => void;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View pointerEvents="box-none" style={[styles.headerRow, style]}>
      {onBack ? <IconButton label="←" accessibilityLabel="Volver" onPress={onBack} /> : null}
      <View style={styles.titlePill}>
        {hero ? <Image source={hero} contentFit="contain" cachePolicy="memory-disk" allowDownscaling style={styles.headerHero} /> : null}
        <View style={styles.headerCopy}>
          {eyebrow ? <Text numberOfLines={1} style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.headerTitle}>{title}</Text>
          {subtitle ? <Text numberOfLines={1} style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {right}
    </View>
  );
}

export function IconButton({ label, accessibilityLabel, onPress, tone = 'dark', disabled = false }: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  tone?: 'dark' | 'light' | 'gold';
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        tone === 'light' && styles.iconButtonLight,
        tone === 'gold' && styles.iconButtonGold,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.iconText, tone !== 'dark' && styles.iconTextDark]}>{label}</Text>
    </Pressable>
  );
}

export function HudPill({ label, value, icon, tone = 'light', style }: {
  label?: string;
  value: string | number;
  icon?: string;
  tone?: 'light' | 'dark' | 'gold' | 'orange';
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[
      styles.hudPill,
      tone === 'dark' && styles.hudDark,
      tone === 'gold' && styles.hudGold,
      tone === 'orange' && styles.hudOrange,
      style,
    ]}>
      {icon ? <Text style={[styles.hudIcon, tone === 'dark' && styles.hudLightText]}>{icon}</Text> : null}
      <View style={styles.hudCopy}>
        {label ? <Text numberOfLines={1} style={[styles.hudLabel, tone === 'dark' && styles.hudLightText]}>{label}</Text> : null}
        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.hudValue, tone === 'dark' && styles.hudValueLight]}>{value}</Text>
      </View>
    </View>
  );
}

export function SceneHotspot({ art, label, sublabel, onPress, selected = false, disabled = false, style, artBackground = 'rgba(255,255,255,0.84)' }: {
  art: ImageSourcePropType;
  label: string;
  sublabel?: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  artBackground?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.hotspot, selected && styles.hotspotSelected, disabled && styles.disabled, style, pressed && !disabled && styles.pressed]}
    >
      <View style={[styles.hotspotArtWell, { backgroundColor: artBackground }]}>
        <Image source={art} contentFit="contain" cachePolicy="memory-disk" allowDownscaling style={styles.hotspotArt} />
      </View>
      <View style={styles.hotspotLabelWrap}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.hotspotLabel}>{label}</Text>
        {sublabel ? <Text numberOfLines={1} style={styles.hotspotSub}>{sublabel}</Text> : null}
      </View>
    </Pressable>
  );
}

export function GameTile({ art, title, badge, meta, onPress, locked = false, style, artBackground = '#E8F4D8' }: {
  art: ImageSourcePropType;
  title: string;
  badge?: string;
  meta?: string;
  onPress?: () => void;
  locked?: boolean;
  style?: StyleProp<ViewStyle>;
  artBackground?: string;
}) {
  const disabled = !onPress || locked;
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? title : undefined}
      accessibilityState={onPress ? { disabled: locked } : undefined}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.gameTile, locked && styles.locked, style, pressed && onPress && !locked && styles.pressed]}
    >
      <View style={[styles.tileArtWell, { backgroundColor: artBackground }]}>
        <Image source={art} contentFit="contain" contentPosition="center" cachePolicy="memory-disk" allowDownscaling style={styles.tileArt} />
        {badge ? <View style={styles.tileBadge}><Text numberOfLines={1} style={styles.tileBadgeText}>{badge}</Text></View> : null}
        {meta ? <View style={styles.tileMeta}><Text numberOfLines={1} style={styles.tileMetaText}>{meta}</Text></View> : null}
      </View>
      <View style={styles.tileFooter}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.tileTitle}>{title}</Text>
        {onPress && !locked ? <View style={styles.playDot}><Text style={styles.playDotText}>›</Text></View> : null}
      </View>
    </Pressable>
  );
}

export function SceneDock({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.dock, style]}>{children}</View>;
}

export function FloatingCard({ children, tone = 'light', style }: { children: React.ReactNode; tone?: 'light' | 'dark'; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.floatingCard, tone === 'dark' && styles.floatingCardDark, style]}>{children}</View>;
}

export function ActionPill({ label, onPress, tone = 'gold', style, disabled = false, accessibilityLabel }: {
  label: string;
  onPress: () => void;
  tone?: 'gold' | 'dark' | 'light';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        tone === 'dark' && styles.actionDark,
        tone === 'light' && styles.actionLight,
        style,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.actionText, tone === 'dark' && styles.actionTextLight]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 7, zIndex: 20 },
  iconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(5,65,44,0.92)', borderWidth: 1.5, borderColor: 'rgba(214,241,201,0.85)', alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  iconButtonLight: { backgroundColor: 'rgba(255,253,244,0.94)', borderColor: 'rgba(255,255,255,0.94)' },
  iconButtonGold: { backgroundColor: '#FFD54F', borderColor: '#FFF1A7' },
  iconText: { color: colors.white, fontSize: 18, lineHeight: 20, fontWeight: '900' },
  iconTextDark: { color: '#0A4934' },
  titlePill: { minWidth: 0, maxWidth: 430, minHeight: 36, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 18, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(5,66,45,0.88)', borderWidth: 1.5, borderColor: 'rgba(140,203,124,0.75)', ...shadows.soft },
  headerHero: { width: 29, height: 29, marginRight: 5 },
  headerCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: '#FFD85A', fontSize: 5.5, lineHeight: 7, fontWeight: '900', letterSpacing: 0.75 },
  headerTitle: { color: colors.white, fontSize: 14, lineHeight: 16, fontWeight: '900' },
  headerSubtitle: { color: '#E1F0DB', fontSize: 6.5, lineHeight: 8, fontWeight: '700' },

  hudPill: { minWidth: 78, height: 34, borderRadius: 17, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,253,244,0.93)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', ...shadows.soft },
  hudDark: { backgroundColor: 'rgba(5,65,44,0.92)', borderColor: 'rgba(139,202,126,0.82)' },
  hudGold: { backgroundColor: '#FFF0A8', borderColor: '#FFD550' },
  hudOrange: { backgroundColor: '#FFE2CA', borderColor: '#FFB678' },
  hudIcon: { color: '#0B533A', fontSize: 13, fontWeight: '900' },
  hudCopy: { flex: 1, minWidth: 0 },
  hudLabel: { color: '#627268', fontSize: 5.5, lineHeight: 6.5, fontWeight: '900', letterSpacing: 0.35 },
  hudValue: { color: '#0B4C36', fontSize: 12, lineHeight: 14, fontWeight: '900' },
  hudLightText: { color: '#DCEED7' },
  hudValueLight: { color: colors.white },

  hotspot: { width: 82, alignItems: 'center' },
  hotspotSelected: { transform: [{ scale: 1.04 }] },
  hotspotArtWell: { width: 64, height: 58, borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...shadows.soft },
  hotspotArt: { width: '88%', height: '88%' },
  hotspotLabelWrap: { marginTop: 3, maxWidth: 82, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 9, backgroundColor: 'rgba(255,253,244,0.94)', ...shadows.soft },
  hotspotLabel: { color: '#0A4B35', fontSize: 8.5, lineHeight: 10, fontWeight: '900', textAlign: 'center' },
  hotspotSub: { color: '#627168', fontSize: 5.5, lineHeight: 7, fontWeight: '700', textAlign: 'center' },

  gameTile: { width: 142, height: 110, borderRadius: 16, backgroundColor: '#FFFDF5', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.95)', overflow: 'hidden', ...shadows.soft },
  locked: { opacity: 0.48 },
  tileArtWell: { height: 76, position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  tileArt: { width: '94%', height: '94%' },
  tileBadge: { position: 'absolute', left: 6, top: 6, maxWidth: '58%', borderRadius: radii.pill, backgroundColor: 'rgba(255,253,244,0.94)', paddingHorizontal: 6, paddingVertical: 2 },
  tileBadgeText: { color: '#164931', fontSize: 5.8, lineHeight: 7, fontWeight: '900', letterSpacing: 0.3 },
  tileMeta: { position: 'absolute', right: 6, top: 6, borderRadius: radii.pill, backgroundColor: 'rgba(5,66,45,0.9)', paddingHorizontal: 6, paddingVertical: 2 },
  tileMetaText: { color: colors.white, fontSize: 5.8, lineHeight: 7, fontWeight: '900' },
  tileFooter: { flex: 1, minHeight: 0, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, backgroundColor: '#FFFDF5' },
  tileTitle: { flex: 1, minWidth: 0, color: '#0A4B35', fontSize: 9.5, lineHeight: 11, fontWeight: '900' },
  playDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFD54F', alignItems: 'center', justifyContent: 'center' },
  playDotText: { color: '#0A4934', fontSize: 16, lineHeight: 17, fontWeight: '900' },

  dock: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 18, backgroundColor: 'rgba(4,53,35,0.76)', borderWidth: 1.5, borderColor: 'rgba(139,202,126,0.68)', ...shadows.soft },
  floatingCard: { borderRadius: 16, backgroundColor: 'rgba(255,253,244,0.94)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.94)', ...shadows.soft },
  floatingCardDark: { backgroundColor: 'rgba(4,54,36,0.88)', borderColor: 'rgba(139,202,126,0.75)' },
  action: { minHeight: 34, borderRadius: 17, backgroundColor: '#FFD54F', borderWidth: 1.5, borderColor: '#FFF1A7', paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  actionDark: { backgroundColor: 'rgba(4,63,42,0.94)', borderColor: '#8BCB7F' },
  actionLight: { backgroundColor: 'rgba(255,253,244,0.95)', borderColor: '#DDE7D0' },
  actionText: { color: '#0A4934', fontSize: 9, lineHeight: 11, fontWeight: '900' },
  actionTextLight: { color: colors.white },
  disabled: { opacity: 0.42 },
  pressed: { transform: [{ scale: 0.965 }] },
});
