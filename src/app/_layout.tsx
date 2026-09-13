import React from 'react';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { migrateDb } from '@/core/data/database';
import { AppDataProvider } from '@/features/session/AppDataProvider';
import { colors } from '@/core/theme/tokens';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SQLiteProvider databaseName="pequenas-finanzas.db" onInit={migrateDb}>
          <AppDataProvider>
            <Stack screenOptions={{
              headerShown: false,
              headerStyle: { backgroundColor: colors.forestDark },
              headerTintColor: colors.white,
              headerTitleStyle: { fontWeight: '900' },
              animation: 'fade',
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
          </AppDataProvider>
        </SQLiteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
