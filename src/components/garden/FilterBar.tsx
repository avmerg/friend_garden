import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TAGS, type Tag } from '@/lib/constants';
import { HEALTH_LABELS, type HealthStatus } from '@/lib/health';

const STATUSES: HealthStatus[] = ['HAPPY', 'OKAY', 'THIRSTY', 'RESTING', 'NEW'];

interface FilterBarProps {
  selectedTags: Tag[];
  selectedStatuses: HealthStatus[];
  onToggleTag: (tag: Tag) => void;
  onToggleStatus: (status: HealthStatus) => void;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <ThemedText type={active ? 'smallBold' : 'small'}>{label}</ThemedText>
    </Pressable>
  );
}

export function FilterBar({ selectedTags, selectedStatuses, onToggleTag, onToggleStatus }: FilterBarProps) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {TAGS.map((tag) => (
          <Chip key={tag} label={tag} active={selectedTags.includes(tag)} onPress={() => onToggleTag(tag)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {STATUSES.map((status) => (
          <Chip
            key={status}
            label={HEALTH_LABELS[status]}
            active={selectedStatuses.includes(status)}
            onPress={() => onToggleStatus(status)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  row: {
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#C9CDD3',
  },
  chipActive: {
    backgroundColor: '#7CB342',
    borderColor: '#7CB342',
  },
});
