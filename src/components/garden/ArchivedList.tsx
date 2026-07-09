import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useArchivedFriends } from '@/hooks/useArchivedFriends';
import { useArchiveFriend } from '@/hooks/useArchiveFriend';
import { PLANT_TYPE_EMOJI, type PlantType } from '@/lib/constants';

export function ArchivedList() {
  const { friends, loading } = useArchivedFriends();
  const { unarchive } = useArchiveFriend();

  if (loading) return null;

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ThemedView type="backgroundElement" style={styles.row}>
            <Text style={styles.emoji}>{PLANT_TYPE_EMOJI[item.plantType as PlantType] ?? '🌱'}</Text>
            <View style={styles.textCol}>
              <ThemedText type="smallBold" numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {item.tag}
              </ThemedText>
            </View>
            <Pressable style={styles.unarchiveButton} onPress={() => unarchive(item)}>
              <ThemedText type="smallBold">Unarchive</ThemedText>
            </Pressable>
          </ThemedView>
        )}
        ListEmptyComponent={
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            No archived friends.
          </ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 12,
  },
  emoji: {
    fontSize: 28,
    opacity: 0.6,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  unarchiveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#7CB342',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
});
