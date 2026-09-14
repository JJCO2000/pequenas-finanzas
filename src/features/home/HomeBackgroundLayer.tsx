import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import type { HomeLayout } from './useHomeLayout';

const HOME_BACKGROUND = require('../../../assets/world/v7/home-background.webp');

type Props = { layout: HomeLayout };

export function HomeBackgroundLayer({ layout }: Props) {
  return (
    <View pointerEvents="none" accessible={false} style={styles.layer} testID="home-background-layer">
      <Image
        source={HOME_BACKGROUND}
        contentFit={layout.backgroundFit}
        contentPosition={layout.backgroundPosition}
        cachePolicy="memory-disk"
        transition={0}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  image: { width: '100%', height: '100%' },
});
