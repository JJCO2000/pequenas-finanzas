import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { HomeDestination } from '../homeDestinations';
import type { HomeLayout } from '../useHomeLayout';

type Props = {
  destination: HomeDestination;
  layout: HomeLayout;
  onPress: () => void;
};

export function HomeDestinationCard({ destination, layout, onPress }: Props) {
  const compact = layout.mode === 'compact';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={destination.label}
      accessibilityHint={destination.hint}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          width: layout.destinationCardWidth,
          minWidth: layout.touchTarget,
          height: layout.destinationCardHeight,
          minHeight: layout.touchTarget,
          borderRadius: compact ? 12 : 18,
          paddingHorizontal: compact ? 4 : 8,
          paddingVertical: compact ? 5 : 9,
          opacity: pressed ? 0.86 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={[styles.iconWell, { width: compact ? 30 : 50, height: compact ? 30 : 50, borderRadius: compact ? 9 : 15 }]}> 
        <Text style={{ fontSize: compact ? 20 : 32 }} accessibilityElementsHidden>{destination.icon}</Text>
      </View>
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.78}
        style={[styles.label, { fontSize: (compact ? 11 : 16) * layout.fontScale, lineHeight: (compact ? 13 : 19) * layout.fontScale }]}
      >
        {destination.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(6, 63, 44, 0.94)',
    borderWidth: 2,
    borderColor: '#79D66B',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconWell: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  label: { color: '#FFFFFF', fontWeight: '800', textAlign: 'center' },
});
