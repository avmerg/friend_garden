import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DIRECTION_LABEL, formatRelativeTime } from '@/lib/time';
import type { ContactLogRow } from '@/db/queries/contactLogs';

interface ContactLogListProps {
  logs: ContactLogRow[];
}

export function ContactLogList({ logs }: ContactLogListProps) {
  if (logs.length === 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary">
        No contact logged yet.
      </ThemedText>
    );
  }

  return (
    <View style={styles.list}>
      {logs.map((log) => (
        <View key={log.id} style={styles.row}>
          <ThemedText type="small">{DIRECTION_LABEL[log.direction] ?? log.direction}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatRelativeTime(log.timestamp)}
          </ThemedText>
        </View>
      ))}
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
  },
});
