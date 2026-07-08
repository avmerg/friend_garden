import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { HEALTH_COLORS, HEALTH_LABELS, type HealthStatus } from '@/lib/health';

interface HealthBadgeProps {
  health: HealthStatus;
  lowTouch?: boolean;
  compact?: boolean;
}

export function HealthBadge({ health, lowTouch, compact }: HealthBadgeProps) {
  const color = HEALTH_COLORS[health];
  const label = HEALTH_LABELS[health];

  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <View style={[styles.dot, { backgroundColor: color }, lowTouch && styles.dotLowTouch]} />
      <ThemedText type={compact ? 'small' : 'default'} themeColor="textSecondary">
        {label}
        {lowTouch ? ' · quiet' : ''}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowCompact: {
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotLowTouch: {
    opacity: 0.55,
  },
});
