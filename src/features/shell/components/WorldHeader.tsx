import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing, typography } from '@/core/theme/tokens';

export function WorldHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.board}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: radii.lg,
    backgroundColor: colors.glassDark,
    borderWidth: 2,
    borderColor: colors.creamStrong,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.card,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: typography.small,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    color: colors.white,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: colors.cream,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 5,
  },
});
