import React from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';

export default function LegacyTabsLayout() {
  const immersiveAndroid = Platform.OS === 'android';
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        navigationBarHidden: immersiveAndroid,
        statusBarHidden: immersiveAndroid,
      }}
    />
  );
}
