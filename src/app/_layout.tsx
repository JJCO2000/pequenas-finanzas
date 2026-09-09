import React from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { migrateDb } from '@/core/data/database';
import { AppDataProvider } from '@/features/session/AppDataProvider';
import { SfxProvider } from '@/features/audio/SfxProvider';
import { colors } from '@/core/theme/tokens';

export default function RootLayout() {
  const immersiveAndroid = Platform.OS === 'android';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider databaseName="pequenas-finanzas.db" onInit={migrateDb}>
        <AppDataProvider>
          <SfxProvider>
            <Stack screenOptions={{
              headerShown: false,
              headerStyle: { backgroundColor: colors.forestDark },
              headerTintColor: colors.white,
              headerTitleStyle: { fontWeight: '900' },
              animation: 'fade',
              navigationBarHidden: immersiveAndroid,
              statusBarHidden: immersiveAndroid,
            }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="start" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="play" />
              <Stack.Screen name="arcade" />
              <Stack.Screen name="wallet" />
              <Stack.Screen name="investments" />
              <Stack.Screen name="progress" />
              <Stack.Screen name="collection" />
              <Stack.Screen name="parents" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="lesson/[id]" />
              <Stack.Screen name="game/[gameId]" />
              <Stack.Screen name="shop" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </SfxProvider>
        </AppDataProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
