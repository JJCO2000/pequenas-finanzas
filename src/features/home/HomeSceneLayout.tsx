import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HomeBackgroundLayer } from './HomeBackgroundLayer';
import { HomeControlsLayer } from './HomeControlsLayer';
import { useHomeLayout } from './useHomeLayout';
import type { HomeMissionViewModel } from './components/HomeMissionCard';

type Props = {
  profileName: string;
  day: number;
  balanceLabel: string;
  avatar: HomeMissionViewModel['art'];
  mission: HomeMissionViewModel;
};

export function HomeSceneLayout(props: Props) {
  const layout = useHomeLayout();
  return (
    <View testID="home-scene-layout" style={styles.root}>
      <HomeBackgroundLayer layout={layout} />
      <HomeControlsLayer {...props} layout={layout} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden', backgroundColor: '#173F2C' },
});
