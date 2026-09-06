import React from 'react';
import { StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/core/theme/tokens';

export type WorldSceneTone = 'none' | 'soft' | 'dark' | 'deep';

export function WorldScene({ background, children, tone = 'soft', safe = true, style, contentStyle }: {
  background: ImageSourcePropType;
  children: React.ReactNode;
  tone?: WorldSceneTone;
  safe?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, style]}>
      <Image source={background} contentFit="cover" contentPosition="center" cachePolicy="memory-disk" allowDownscaling transition={120} style={styles.backdrop} />
      {tone !== 'none' ? <View pointerEvents="none" style={[styles.tint, tone === 'dark' && styles.dark, tone === 'deep' && styles.deep]} /> : null}
      <View style={[styles.content, safe && {
        paddingLeft: Math.max(insets.left, 12), paddingRight: Math.max(insets.right, 12),
        paddingTop: Math.max(insets.top, 10), paddingBottom: Math.max(insets.bottom, 10),
      }, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: colors.forestDark },
  content: { flex: 1, minWidth: 0, minHeight: 0 },
  backdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  tint: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(9, 47, 32, 0.10)' },
  dark: { backgroundColor: 'rgba(4, 34, 23, 0.27)' },
  deep: { backgroundColor: 'rgba(4, 27, 19, 0.44)' },
});
