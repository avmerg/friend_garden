import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { PersonTabBar, type PersonTab } from '@/components/person/PersonTabBar';
import { OverviewTab } from '@/components/person/OverviewTab';
import { SettingsTab } from '@/components/person/SettingsTab';
import { NotesTabStub } from '@/components/person/NotesTabStub';
import { useFriend } from '@/hooks/useFriend';

export default function PersonCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { friend, health, logs, loading } = useFriend(id);
  const [tab, setTab] = useState<PersonTab>('overview');

  if (loading || !friend || !health) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <PersonTabBar active={tab} onChange={setTab} />
      {tab === 'overview' && <OverviewTab friend={friend} health={health} logs={logs} />}
      {tab === 'settings' && <SettingsTab friend={friend} />}
      {tab === 'notes' && <NotesTabStub />}
    </ThemedView>
  );
}
