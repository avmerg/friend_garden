import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { DashboardStats } from '@/lib/dashboard';
import { TAGS } from '@/lib/constants';

interface TagBreakdownListProps {
  byTag: DashboardStats['byTag'];
}

export function TagBreakdownList({ byTag }: TagBreakdownListProps) {
  return (
    <View style={styles.list}>
      <ThemedText type="smallBold">By tag</ThemedText>
      {TAGS.map((tag) => {
        const tagStats = byTag[tag];
        return (
          <View key={tag} style={styles.row}>
            <ThemedText type="small">{tag}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {tagStats?.total ?? 0} friend{(tagStats?.total ?? 0) === 1 ? '' : 's'} ·{' '}
              {tagStats?.notThirstyPercent ?? 0}% thriving
            </ThemedText>
          </View>
        );
      })}
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
