import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WaterButton } from '@/components/shared/WaterButton';
import { ReachedOutButton } from '@/components/shared/ReachedOutButton';
import { PLANT_TYPE_EMOJI, type PlantType } from '@/lib/constants';
import type { TodayItem } from '@/hooks/useToday';

function reasonText(item: TodayItem): string {
  if (item.result.health === 'NEW') return 'New friend — say hi!';
  const overdue = item.result.daysOverdue ?? 0;
  if (overdue > 0) return `${overdue} day${overdue === 1 ? '' : 's'} overdue`;
  return 'Due soon';
}

export function TodayListItem({ item }: { item: TodayItem }) {
  const router = useRouter();
  const { friend } = item;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Pressable style={styles.mainRow} onPress={() => router.push(`/friend/${friend.id}`)}>
        <Text style={styles.emoji}>{PLANT_TYPE_EMOJI[friend.plantType as PlantType] ?? '🌱'}</Text>
        <View style={styles.textCol}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {friend.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {reasonText(item)}
          </ThemedText>
        </View>
      </Pressable>
      <View style={styles.actionRow}>
        <WaterButton friendId={friend.id} />
        <ReachedOutButton friendId={friend.id} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emoji: {
    fontSize: 28,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
