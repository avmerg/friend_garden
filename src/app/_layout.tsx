import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useColorScheme } from 'react-native';

import { db } from '@/db/client';
import { seedIfEmpty } from '@/db/seed';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import migrations from '@/db/migrations/migrations';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { success: migrationsReady, error: migrationError } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<Error | null>(null);

  useEffect(() => {
    if (!migrationsReady) return;
    seedIfEmpty()
      .then(() => setSeeded(true))
      .catch((err: Error) => {
        console.error('Seeding failed:', err);
        setSeedError(err);
      });
  }, [migrationsReady]);

  if (migrationError || seedError) {
    const error = migrationError ?? seedError;
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 }}>
        <ThemedText type="smallBold">
          {migrationError ? 'Migration failed' : 'Seeding failed'}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {error?.message}
        </ThemedText>
      </ThemedView>
    );
  }

  if (!migrationsReady || !seeded) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="friend/[id]" options={{ title: '' }} />
        <Stack.Screen name="archived" options={{ title: 'Archived' }} />
      </Stack>
    </ThemeProvider>
  );
}
