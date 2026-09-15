import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { HomeDestination } from '../homeDestinations';
import type { HomeLayout } from '../useHomeLayout';

type Props = {
  destination: HomeDestination;
  layout: HomeLayout;
  onPress: () => void;
};

export function HomeDestinationCard({ destination, layout, onPress }: Props) {
  const compact = layout.mode === 'compact';
  const expanded = layout.mode === 'expanded';
  const artHeight = compact ? 29 : Math.round(layout.destinationCardHeight * (expanded ? 0.61 : 0.59));

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
          borderRadius: compact ? 12 : 20,
          padding: compact ? 4 : 7,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.975 : 1 }],
        },
      ]}
    >
      <View
        style={[
          styles.artWell,
          {
            height: artHeight,
            borderRadius: compact ? 9 : 15,
            backgroundColor: destination.artBackground,
          },
        ]}
      >
        <Image
          source={destination.art}
          contentFit="contain"
          cachePolicy="memory-disk"
          allowDownscaling
          style={styles.art}
        />
      </View>

      <View style={[styles.copy, { paddingTop: compact ? 2 : 5 }]}> 
        <Text
          numberOfLines={compact ? 2 : 1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          style={[
            styles.label,
            {
              fontSize: (compact ? 10.5 : expanded ? 19 : 17) * layout.fontScale,
              lineHeight: (compact ? 12 : expanded ? 22 : 20) * layout.fontScale,
            },
          ]}
        >
          {destination.label}
        </Text>
        {!compact ? (
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            style={[styles.subtitle, { fontSize: (expanded ? 12 : 11) * layout.fontScale }]}
          >
            {destination.subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFDF2',
    borderWidth: 2,
    borderColor: '#F4EFD9',
    alignItems: 'stretch',
    overflow: 'hidden',
    shadowColor: '#062F23',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 5,
    elevation: 5,
  },
  artWell: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  art: { width: '92%', height: '92%' },
  copy: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  label: { color: '#0B4E38', fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#58766A', fontWeight: '800', textAlign: 'center', marginTop: 1 },
});
