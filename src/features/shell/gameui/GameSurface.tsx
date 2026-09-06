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
import { colors, radii, shadows, typography } from '@/core/theme/tokens';

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
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={styles.headerTitle}>{title}</Text>
          {subtitle ? <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9} style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {right}
    </View>
  );
}

export function IconButton({ label, accessibilityLabel, onPress, tone = 'dark' }: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  tone?: 'dark' | 'light' | 'gold';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        tone === 'light' && styles.iconButtonLight,
        tone === 'gold' && styles.iconButtonGold,
        pressed && styles.pressed,
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
        {label ? <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9} style={[styles.hudLabel, tone === 'dark' && styles.hudLightText]}>{label}</Text> : null}
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9} style={[styles.hudValue, tone === 'dark' && styles.hudValueLight]}>{value}</Text>
      </View>
    </View>
  );
}

export function SceneHotspot({ art, label, sublabel, onPress, selected = false, style, artBackground = 'rgba(255,255,255,0.84)' }: {
  art: ImageSourcePropType;
  label: string;
  sublabel?: string;
  onPress: () => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  artBackground?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.hotspot, selected && styles.hotspotSelected, style, pressed && styles.pressed]}
    >
      <View style={[styles.hotspotArtWell, { backgroundColor: artBackground }]}>
        <Image source={art} contentFit="contain" cachePolicy="memory-disk" allowDownscaling style={styles.hotspotArt} />
      </View>
      <View style={styles.hotspotLabelWrap}>
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9} style={styles.hotspotLabel}>{label}</Text>
        {sublabel ? <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9} style={styles.hotspotSub}>{sublabel}</Text> : null}
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
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? title : undefined}
      disabled={!onPress || locked}
      onPress={onPress}
      style={({ pressed }) => [styles.gameTile, locked && styles.locked, style, pressed && onPress && !locked && styles.pressed]}
    >
      <View style={[styles.tileArtWell, { backgroundColor: artBackground }]}>
        <Image source={art} contentFit="contain" contentPosition="center" cachePolicy="memory-disk" allowDownscaling style={styles.tileArt} />
        {badge ? <View style={styles.tileBadge}><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9} style={styles.tileBadgeText}>{badge}</Text></View> : null}
        {meta ? <View style={styles.tileMeta}><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9} style={styles.tileMetaText}>{meta}</Text></View> : null}
      </View>
      <View style={styles.tileFooter}>
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9} style={styles.tileTitle}>{title}</Text>
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

export function ActionPill({ label, onPress, tone = 'gold', style }: { label: string; onPress: () => void; tone?: 'gold' | 'dark' | 'light'; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, tone === 'dark' && styles.actionDark, tone === 'light' && styles.actionLight, style, pressed && styles.pressed]}>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9} style={[styles.actionText, tone === 'dark' && styles.actionTextLight]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7, zIndex: 20 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(5,65,44,0.92)', borderWidth: 1.5, borderColor: 'rgba(214,241,201,0.85)', alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  iconButtonLight: { backgroundColor: 'rgba(255,253,244,0.94)', borderColor: 'rgba(255,255,255,0.94)' },
  iconButtonGold: { backgroundColor: '#FFD54F', borderColor: '#FFF1A7' },
  iconText: { color: colors.white, fontSize: 19, lineHeight: 21, fontWeight: '900' },
  iconTextDark: { color: '#0A4934' },
  titlePill: { minWidth: 0, maxWidth: 470, minHeight: 42, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 21, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(5,66,45,0.88)', borderWidth: 1.5, borderColor: 'rgba(140,203,124,0.75)', ...shadows.soft },
  headerHero: { width: 32, height: 32, marginRight: 6 },
  headerCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: '#FFD85A', fontSize: typography.micro, lineHeight: 11, fontWeight: '900', letterSpacing: 0.55 },
  headerTitle: { color: colors.white, fontSize: 15, lineHeight: 17, fontWeight: '900' },
  headerSubtitle: { color: '#E1F0DB', fontSize: typography.caption, lineHeight: 13, fontWeight: '700' },

  hudPill: { minWidth: 88, minHeight: 40, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,253,244,0.93)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', ...shadows.soft },
  hudDark: { backgroundColor: 'rgba(5,65,44,0.92)', borderColor: 'rgba(139,202,126,0.82)' },
  hudGold: { backgroundColor: '#FFF0A8', borderColor: '#FFD550' },
  hudOrange: { backgroundColor: '#FFE2CA', borderColor: '#FFB678' },
  hudIcon: { color: '#0B533A', fontSize: 14, fontWeight: '900' },
  hudCopy: { flex: 1, minWidth: 0 },
  hudLabel: { color: '#627268', fontSize: typography.micro, lineHeight: 11, fontWeight: '900', letterSpacing: 0.25 },
  hudValue: { color: '#0B4C36', fontSize: 13, lineHeight: 15, fontWeight: '900' },
  hudLightText: { color: '#DCEED7' },
  hudValueLight: { color: colors.white },

  hotspot: { width: 92, alignItems: 'center' },
  hotspotSelected: { transform: [{ scale: 1.04 }] },
  hotspotArtWell: { width: 66, height: 60, borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...shadows.soft },
  hotspotArt: { width: '88%', height: '88%' },
  hotspotLabelWrap: { marginTop: 3, maxWidth: 92, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 9, backgroundColor: 'rgba(255,253,244,0.94)', ...shadows.soft },
  hotspotLabel: { color: '#0A4B35', fontSize: typography.caption, lineHeight: 12, fontWeight: '900', textAlign: 'center' },
  hotspotSub: { color: '#627168', fontSize: typography.micro, lineHeight: 11, fontWeight: '700', textAlign: 'center' },

  gameTile: { width: 142, height: 118, borderRadius: 16, backgroundColor: '#FFFDF5', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.95)', overflow: 'hidden', ...shadows.soft },
  locked: { opacity: 0.48 },
  tileArtWell: { height: 78, position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  tileArt: { width: '94%', height: '94%' },
  tileBadge: { position: 'absolute', left: 6, top: 6, maxWidth: '62%', borderRadius: radii.pill, backgroundColor: 'rgba(255,253,244,0.94)', paddingHorizontal: 6, paddingVertical: 3 },
  tileBadgeText: { color: '#164931', fontSize: typography.micro, lineHeight: 11, fontWeight: '900', letterSpacing: 0.2 },
  tileMeta: { position: 'absolute', right: 6, top: 6, borderRadius: radii.pill, backgroundColor: 'rgba(5,66,45,0.9)', paddingHorizontal: 6, paddingVertical: 3 },
  tileMetaText: { color: colors.white, fontSize: typography.micro, lineHeight: 11, fontWeight: '900' },
  tileFooter: { flex: 1, minHeight: 0, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, backgroundColor: '#FFFDF5' },
  tileTitle: { flex: 1, minWidth: 0, color: '#0A4B35', fontSize: typography.label, lineHeight: 14, fontWeight: '900' },
  playDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFD54F', alignItems: 'center', justifyContent: 'center' },
  playDotText: { color: '#0A4934', fontSize: 17, lineHeight: 18, fontWeight: '900' },

  dock: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 18, backgroundColor: 'rgba(4,53,35,0.76)', borderWidth: 1.5, borderColor: 'rgba(139,202,126,0.68)', ...shadows.soft },
  floatingCard: { borderRadius: 16, backgroundColor: 'rgba(255,253,244,0.94)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.94)', ...shadows.soft },
  floatingCardDark: { backgroundColor: 'rgba(4,54,36,0.88)', borderColor: 'rgba(139,202,126,0.75)' },
  action: { minHeight: 40, borderRadius: 20, backgroundColor: '#FFD54F', borderWidth: 1.5, borderColor: '#FFF1A7', paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  actionDark: { backgroundColor: 'rgba(4,63,42,0.94)', borderColor: '#8BCB7F' },
  actionLight: { backgroundColor: 'rgba(255,253,244,0.95)', borderColor: '#DDE7D0' },
  actionText: { color: '#0A4934', fontSize: typography.label, lineHeight: 14, fontWeight: '900' },
  actionTextLight: { color: colors.white },
  pressed: { transform: [{ scale: 0.965 }] },
});
