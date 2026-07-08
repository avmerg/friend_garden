import { useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UndoToast } from '@/components/shared/UndoToast';
import { FriendCard } from '@/components/garden/FriendCard';
import { FilterBar } from '@/components/garden/FilterBar';
import { useFriends, type FriendWithHealth } from '@/hooks/useFriends';
import { useLogContact } from '@/hooks/useLogContact';
import { applyGardenFilters } from '@/lib/filters';
import type { Tag } from '@/lib/constants';
import type { HealthStatus } from '@/lib/health';
import type { ContactLogRow } from '@/db/queries/contactLogs';

export function GardenGrid() {
  const { friends, loading } = useFriends();
  const { logContact, undoLogContact } = useLogContact();
  const [splashKeys, setSplashKeys] = useState<Record<string, number>>({});
  const [pendingUndo, setPendingUndo] = useState<{ log: ContactLogRow; friendName: string } | null>(
    null,
  );
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<HealthStatus[]>([]);

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const toggleStatus = (status: HealthStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  };

  const filteredFriends = useMemo(
    () => applyGardenFilters(friends, selectedTags, selectedStatuses),
    [friends, selectedTags, selectedStatuses],
  );

  const handleLongPressWater = async (item: FriendWithHealth) => {
    const log = await logContact(item.friend.id, 'outbound');
    setSplashKeys((prev) => ({ ...prev, [item.friend.id]: (prev[item.friend.id] ?? 0) + 1 }));
    setPendingUndo({ log, friendName: item.friend.name });
  };

  const handleUndo = async () => {
    if (!pendingUndo) return;
    await undoLogContact(pendingUndo.log.id);
    setPendingUndo(null);
  };

  if (loading) return null;

  return (
    <ThemedView style={styles.container}>
      <FilterBar
        selectedTags={selectedTags}
        selectedStatuses={selectedStatuses}
        onToggleTag={toggleTag}
        onToggleStatus={toggleStatus}
      />
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.friend.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <FriendCard
            item={item}
            splashKey={splashKeys[item.friend.id] ?? 0}
            onLongPressWater={handleLongPressWater}
          />
        )}
        ListEmptyComponent={
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            {friends.length === 0 ? 'No friends yet.' : 'No friends match these filters.'}
          </ThemedText>
        }
      />
      {pendingUndo && (
        <UndoToast
          message={`Watered ${pendingUndo.friendName}`}
          onUndo={handleUndo}
          onDismiss={() => setPendingUndo(null)}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
});
