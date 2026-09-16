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
  const artHeight = compact
    ? 32
    : Math.round(layout.destinationCardHeight * (expanded ? 0.69 : 0.68));

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
          borderRadius: compact ? 12 : 22,
          borderWidth: compact ? 2 : 3,
          padding: compact ? 4 : 7,
          opacity: pressed ? 0.94 : 1,
          transform: [{ scale: pressed ? 0.975 : 1 }],
        },
      ]}
    >
      <View
        style={[
          styles.artWell,
          {
            height: artHeight,
            borderRadius: compact ? 8 : 16,
            backgroundColor: destination.artBackground,
          },
        ]}
      >
        {destination.artLayers ? (
          <View pointerEvents="none" style={styles.layerStage}>
            <Image
              source={destination.artLayers.background}
              contentFit="cover"
              cachePolicy="memory-disk"
              allowDownscaling
              style={styles.layerBackground}
            />
            <Image
              source={destination.artLayers.mascot}
              contentFit="contain"
              cachePolicy="memory-disk"
              allowDownscaling
              style={[styles.layerMascot, compact && styles.layerMascotCompact]}
            />
            <Image
              source={destination.artLayers.prop}
              contentFit="contain"
              cachePolicy="memory-disk"
              allowDownscaling
              style={[styles.layerProp, compact && styles.layerPropCompact]}
            />
          </View>
        ) : destination.art ? (
          <Image
            source={destination.art}
            contentFit="cover"
            cachePolicy="memory-disk"
            allowDownscaling
            style={styles.art}
          />
        ) : null}
      </View>

      <View style={[styles.copy, { paddingTop: compact ? 1 : 5, paddingHorizontal: compact ? 0 : 2 }]}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={compact ? 0.55 : 0.78}
          style={[
            styles.label,
            compact && styles.labelCompact,
            {
              fontSize: (compact ? 8 : expanded ? 20 : 18) * layout.fontScale,
              lineHeight: (compact ? 9 : expanded ? 23 : 21) * layout.fontScale,
            },
          ]}
        >
          {destination.label}
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={compact ? 0.55 : 0.75}
          style={[
            styles.subtitle,
            compact && styles.subtitleCompact,
            {
              fontSize: (compact ? 5.5 : expanded ? 13 : 12) * layout.fontScale,
              lineHeight: (compact ? 6.5 : expanded ? 15 : 14) * layout.fontScale,
            },
          ]}
        >
          {destination.subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFDF4',
    borderColor: '#F1EBD4',
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
  art: { width: '100%', height: '100%' },
  layerStage: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  layerBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  layerMascot: {
    position: 'absolute',
    left: '-9%',
    bottom: '-15%',
    width: '82%',
    height: '121%',
  },
  layerMascotCompact: {
    left: '-7%',
    bottom: '-16%',
    width: '82%',
    height: '122%',
  },
  layerProp: {
    position: 'absolute',
    right: '-1%',
    bottom: '4%',
    width: '42%',
    height: '63%',
  },
  layerPropCompact: {
    right: '-2%',
    bottom: '3%',
    width: '43%',
    height: '64%',
  },
  copy: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: '#0A4A36', fontWeight: '900', textAlign: 'center', letterSpacing: -0.15 },
  labelCompact: { letterSpacing: -0.3 },
  subtitle: { color: '#5A756B', fontWeight: '800', textAlign: 'center', marginTop: 1 },
  subtitleCompact: { letterSpacing: -0.18 },
});