import { ScrollView, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { HealthSummaryCard } from '@/components/dashboard/HealthSummaryCard';
import { TagBreakdownList } from '@/components/dashboard/TagBreakdownList';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { useDashboard } from '@/hooks/useDashboard';

export function Dashboard() {
  const { stats, activity, streak, loading } = useDashboard();

  if (loading) return null;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <HealthSummaryCard stats={stats} streak={streak} />
        <TagBreakdownList byTag={stats.byTag} />
        <ActivityFeed activity={activity} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
});
