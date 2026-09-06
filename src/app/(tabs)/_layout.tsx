import React from 'react';
import { Stack } from 'expo-router';

export default function LegacyTabsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
