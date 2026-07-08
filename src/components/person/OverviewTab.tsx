import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { HealthBadge } from '@/components/shared/HealthBadge';
import { WaterButton } from '@/components/shared/WaterButton';
import { ReachedOutButton } from '@/components/shared/ReachedOutButton';
import { ContactLogList } from '@/components/person/ContactLogList';
import type { FriendRow } from '@/db/queries/friends';
import type { ContactLogRow } from '@/db/queries/contactLogs';
import type { HealthStatus } from '@/lib/health';
import { PLANT_TYPE_EMOJI, type PlantType } from '@/lib/constants';

interface OverviewTabProps {
  friend: FriendRow;
  health: HealthStatus;
  logs: ContactLogRow[];
}

export function OverviewTab({ friend, health, logs }: OverviewTabProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.name}>
          {PLANT_TYPE_EMOJI[friend.plantType as PlantType] ?? '🌱'} {friend.name}
        </ThemedText>
        <HealthBadge health={health} lowTouch={friend.lowTouch} />
      </View>

      <View style={styles.detailBlock}>
        <ThemedText type="small" themeColor="textSecondary">
          {friend.tag} · {friend.plantType}
          {friend.location ? ` · ${friend.location}` : ''}
        </ThemedText>
        {friend.bio ? <ThemedText type="default">{friend.bio}</ThemedText> : null}
        {friend.phone ? <ThemedText type="small">{friend.phone}</ThemedText> : null}
        {friend.email ? <ThemedText type="small">{friend.email}</ThemedText> : null}
      </View>

      <View style={styles.actionRow}>
        <WaterButton friendId={friend.id} />
        <ReachedOutButton friendId={friend.id} />
      </View>

      <View style={styles.logSection}>
        <ThemedText type="smallBold" style={styles.logHeading}>
          Recent contact
        </ThemedText>
        <ContactLogList logs={logs} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 20,
  },
  header: {
    gap: 8,
  },
  name: {
    fontSize: 28,
    lineHeight: 32,
  },
  detailBlock: {
    gap: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  logSection: {
    gap: 8,
  },
  logHeading: {
    marginBottom: 4,
  },
});
