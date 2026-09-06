import React from 'react';
import { Pressable, StyleSheet, Text, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors, radii, shadows } from '@/core/theme/tokens';

export function WorldLibraryCard({
  art,
  title,
  subtitle,
  badge,
  meta,
  onPress,
  compact = false,
  locked = false,
  style,
  artFit = 'cover',
  artBackground = '#DFF2E0',
}: {
  art: ImageSourcePropType;
  title: string;
  subtitle?: string;
  badge?: string;
  meta?: string;
  onPress?: () => void;
  compact?: boolean;
  locked?: boolean;
  style?: StyleProp<ViewStyle>;
  artFit?: 'cover' | 'contain';
  artBackground?: string;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? title : undefined}
      disabled={!onPress || locked}
      onPress={onPress}
      style={({ pressed }) => [styles.card, compact && styles.cardCompact, locked && styles.locked, style, pressed && onPress && !locked && styles.pressed]}
    >
      <View style={[styles.artWell, { backgroundColor: artBackground }]}>
        <Image source={art} contentFit={artFit} cachePolicy="memory-disk" allowDownscaling style={styles.art} />
        <View pointerEvents="none" style={styles.artShade} />
        {badge ? <View style={styles.badge}><Text numberOfLines={1} style={styles.badgeText}>{badge}</Text></View> : null}
        {meta ? <View style={styles.meta}><Text numberOfLines={1} style={styles.metaText}>{meta}</Text></View> : null}
      </View>
      <View style={styles.copy}>
        <View style={styles.copyText}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.title}>{title}</Text>
          {subtitle ? <Text numberOfLines={compact ? 1 : 2} style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {onPress ? <View style={styles.go}><Text style={styles.goText}>→</Text></View> : null}
      </View>
      <View pointerEvents="none" style={styles.topShine} />
    </Pressable>
  );
}


export function WorldMiniTile({
  art,
  title,
  subtitle,
  badge,
  onPress,
  selected = false,
  locked = false,
  style,
  artFit = 'contain',
  artBackground = '#DFF2E0',
}: {
  art: ImageSourcePropType;
  title: string;
  subtitle?: string;
  badge?: string;
  onPress?: () => void;
  selected?: boolean;
  locked?: boolean;
  style?: StyleProp<ViewStyle>;
  artFit?: 'cover' | 'contain';
  artBackground?: string;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? title : undefined}
      disabled={!onPress || locked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.miniTile,
        selected && styles.miniTileSelected,
        locked && styles.locked,
        style,
        pressed && onPress && !locked && styles.pressed,
      ]}
    >
      <View style={[styles.miniArtWell, { backgroundColor: artBackground }]}>
        <Image source={art} contentFit={artFit} cachePolicy="memory-disk" allowDownscaling style={styles.art} />
        {badge ? <View style={styles.miniBadge}><Text numberOfLines={1} style={styles.miniBadgeText}>{badge}</Text></View> : null}
      </View>
      <View style={styles.miniCopy}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.miniTitle}>{title}</Text>
        {subtitle ? <Text numberOfLines={1} style={styles.miniSubtitle}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

export function WorldLibraryTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionHead}>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 128,
    borderRadius: 20,
    backgroundColor: '#FFFDF5',
    borderWidth: 2,
    borderColor: '#F8F1DB',
    overflow: 'hidden',
    ...shadows.card,
  },
  cardCompact: { minHeight: 108 },
  locked: { opacity: 0.48 },
  artWell: { flex: 1.35, minHeight: 66, position: 'relative', overflow: 'hidden' },
  art: { width: '100%', height: '100%' },
  artShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 30, backgroundColor: 'rgba(4,45,30,0.12)' },
  badge: { position: 'absolute', left: 10, top: 10, maxWidth: '60%', borderRadius: radii.pill, backgroundColor: '#F0F8CC', borderWidth: 2, borderColor: 'rgba(255,255,255,0.86)', paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#164931', fontSize: 8, lineHeight: 10, fontWeight: '900', letterSpacing: 0.5 },
  meta: { position: 'absolute', right: 10, top: 10, borderRadius: radii.pill, backgroundColor: 'rgba(8,67,47,0.92)', borderWidth: 2, borderColor: '#DDF1D1', paddingHorizontal: 9, paddingVertical: 4 },
  metaText: { color: colors.white, fontSize: 7, lineHeight: 9, fontWeight: '900' },
  copy: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 6, backgroundColor: '#FFFDF5' },
  copyText: { flex: 1, minWidth: 0 },
  title: { color: '#0B4A34', fontSize: 13, lineHeight: 15, fontWeight: '900' },
  subtitle: { color: '#4D675B', fontSize: 7, lineHeight: 9, fontWeight: '700', marginTop: 1 },
  go: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFD54F', borderWidth: 2, borderColor: '#FFF3B2', alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  goText: { color: '#0A432F', fontSize: 16, lineHeight: 18, fontWeight: '900' },
  topShine: { position: 'absolute', left: 16, right: 16, top: 4, height: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.72)' },
  pressed: { transform: [{ scale: 0.985 }] },
  miniTile: { width: 142, height: 108, borderRadius: 18, backgroundColor: '#FFFDF5', borderWidth: 2, borderColor: '#F5EFD8', overflow: 'hidden', ...shadows.soft },
  miniTileSelected: { borderColor: '#FFD34E', transform: [{ scale: 1.01 }] },
  miniArtWell: { height: 68, position: 'relative', overflow: 'hidden' },
  miniBadge: { position: 'absolute', left: 6, top: 6, maxWidth: '72%', borderRadius: radii.pill, backgroundColor: 'rgba(255,253,245,0.92)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 6, paddingVertical: 2 },
  miniBadgeText: { color: '#164931', fontSize: 6, lineHeight: 8, fontWeight: '900', letterSpacing: 0.35 },
  miniCopy: { flex: 1, minHeight: 0, justifyContent: 'center', paddingHorizontal: 8, backgroundColor: '#FFFDF5' },
  miniTitle: { color: '#0B4A34', fontSize: 12, lineHeight: 14, fontWeight: '900' },
  miniSubtitle: { color: '#5C6F64', fontSize: 6.5, lineHeight: 8, fontWeight: '700', marginTop: 1 },
  sectionHead: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  sectionCopy: { flex: 1, minWidth: 0 },
  sectionTitle: { color: colors.white, fontSize: 17, lineHeight: 19, fontWeight: '900' },
  sectionSubtitle: { color: '#DCEFD8', fontSize: 8, lineHeight: 10, fontWeight: '700', marginTop: 1 },
});
