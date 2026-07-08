import { FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TodayListItem } from '@/components/today/TodayListItem';
import { useToday } from '@/hooks/useToday';
import { useStreak } from '@/hooks/useStreak';

export function TodayList() {
  const { items, loading } = useToday();
  const { streak } = useStreak();

  if (loading) return null;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.heading}>
          A few friends to reach out to
        </ThemedText>
        {streak > 0 && (
          <ThemedText type="small" themeColor="textSecondary">
            🔥 {streak} day{streak === 1 ? '' : 's'} in a row
          </ThemedText>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.friend.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <TodayListItem item={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText type="default">You&apos;re all caught up 🌿</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    gap: 4,
  },
  heading: {
    fontSize: 24,
    lineHeight: 28,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  empty: {
    alignItems: 'center',
    marginTop: 40,
  },
});
