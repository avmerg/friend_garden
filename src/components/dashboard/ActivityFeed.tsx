import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DIRECTION_LABEL, formatRelativeTime } from '@/lib/time';
import type { ActivityEntry } from '@/db/queries/contactLogs';

interface ActivityFeedProps {
  activity: ActivityEntry[];
}

export function ActivityFeed({ activity }: ActivityFeedProps) {
  return (
    <View style={styles.list}>
      <ThemedText type="smallBold">Recent activity</ThemedText>
      {activity.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Nothing logged yet.
        </ThemedText>
      ) : (
        activity.map((entry) => (
          <View key={entry.id} style={styles.row}>
            <ThemedText type="small" numberOfLines={1} style={styles.name}>
              {entry.friendName} · {DIRECTION_LABEL[entry.direction] ?? entry.direction}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatRelativeTime(entry.timestamp)}
            </ThemedText>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
  },
});
