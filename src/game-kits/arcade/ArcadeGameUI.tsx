import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, shadows, spacing, typography } from '@/core/theme/tokens';

export function GameHud({ left, right }: { left: string; right?: string }) {
  return (
    <View style={styles.hud}>
      <Text style={styles.hudText}>{left}</Text>
      {right ? <Text style={styles.hudText}>{right}</Text> : null}
    </View>
  );
}

export function GamePanel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function GameChoice({
  label,
  caption,
  onPress,
  selected = false,
  disabled = false,
  compact = false,
}: {
  label: string;
  caption?: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        compact && styles.choiceCompact,
        selected && styles.choiceSelected,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.choiceLabel, selected && styles.choiceLabelSelected]}>{label}</Text>
      {caption ? <Text style={[styles.choiceCaption, selected && styles.choiceLabelSelected]}>{caption}</Text> : null}
    </Pressable>
  );
}

export function GameAction({
  label,
  onPress,
  disabled = false,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        secondary && styles.actionSecondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.actionText, secondary && styles.actionTextSecondary]}>{label}</Text>
    </Pressable>
  );
}

export function GameNotice({
  text,
  good = false,
}: {
  text: string;
  good?: boolean;
}) {
  return (
    <View style={[styles.notice, good && styles.noticeGood]}>
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    width: '100%',
    minHeight: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hudText: {
    color: colors.forestDark,
    fontSize: typography.small,
    fontWeight: '900',
  },
  panel: {
    borderRadius: radii.lg,
    backgroundColor: colors.glassCream,
    borderWidth: 2,
    borderColor: colors.creamStrong,
    padding: spacing.md,
    ...shadows.card,
  },
  choice: {
    minHeight: 58,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.creamStrong,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceCompact: {
    minHeight: 46,
    paddingVertical: 6,
  },
  choiceSelected: {
    backgroundColor: colors.gold,
    borderColor: colors.forestDark,
  },
  choiceLabel: {
    color: colors.forestDark,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  choiceCaption: {
    color: colors.inkMuted,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  choiceLabelSelected: {
    color: colors.ink,
  },
  action: {
    minHeight: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.forest,
    borderWidth: 2,
    borderColor: colors.forestDark,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSecondary: {
    backgroundColor: colors.surface,
  },
  actionText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  actionTextSecondary: {
    color: colors.forestDark,
  },
  notice: {
    minHeight: 34,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 7,
    justifyContent: 'center',
  },
  noticeGood: {
    backgroundColor: colors.sky,
  },
  noticeText: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
