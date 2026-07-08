import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HEALTH_COLORS, HEALTH_LABELS, type HealthStatus } from '@/lib/health';
import type { DashboardStats } from '@/lib/dashboard';

const ORDER: HealthStatus[] = ['HAPPY', 'OKAY', 'THIRSTY', 'RESTING', 'NEW'];

interface HealthSummaryCardProps {
  stats: DashboardStats;
  streak: number;
}

export function HealthSummaryCard({ stats, streak }: HealthSummaryCardProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.heroRow}>
        <ThemedText type="title" style={styles.heroPercent}>
          {stats.healthyPercent}%
        </ThemedText>
        <View style={styles.heroTextCol}>
          <ThemedText type="smallBold">of your garden is thriving</ThemedText>
          {streak > 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              🔥 {streak} day{streak === 1 ? '' : 's'} in a row
            </ThemedText>
          )}
        </View>
      </View>

      <View style={styles.countsRow}>
        {ORDER.map((status) => (
          <View key={status} style={styles.countItem}>
            <View style={[styles.dot, { backgroundColor: HEALTH_COLORS[status] }]} />
            <ThemedText type="smallBold">{stats.countsByHealth[status]}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {HEALTH_LABELS[status]}
            </ThemedText>
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroPercent: {
    fontSize: 44,
    lineHeight: 48,
  },
  heroTextCol: {
    flex: 1,
    gap: 2,
  },
  countsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  countItem: {
    alignItems: 'center',
    gap: 2,
    minWidth: 56,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
