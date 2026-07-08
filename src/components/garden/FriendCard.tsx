import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HealthBadge } from '@/components/shared/HealthBadge';
import { WaterSplash } from '@/components/shared/WaterSplash';
import { HEALTH_COLORS } from '@/lib/health';
import { PLANT_TYPE_EMOJI, type PlantType } from '@/lib/constants';
import type { FriendWithHealth } from '@/hooks/useFriends';

const WILTED_OPACITY: Record<string, number> = {
  HAPPY: 1,
  OKAY: 0.9,
  THIRSTY: 0.55,
  RESTING: 0.7,
  NEW: 0.8,
};

interface FriendCardProps {
  item: FriendWithHealth;
  onLongPressWater: (item: FriendWithHealth) => void;
  splashKey: number;
}

export function FriendCard({ item, onLongPressWater, splashKey }: FriendCardProps) {
  const router = useRouter();
  const { friend, health } = item;
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={() => router.push(`/friend/${friend.id}`)}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPressWater(item);
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      delayLongPress={350}
    >
      <ThemedView
        type="backgroundElement"
        style={[
          styles.card,
          { borderColor: HEALTH_COLORS[health] },
          pressed && styles.cardPressed,
        ]}
      >
        <WaterSplash triggerKey={splashKey} color="#B8E3D1" />
        <Text style={[styles.plant, { opacity: WILTED_OPACITY[health] ?? 1 }]}>
          {PLANT_TYPE_EMOJI[friend.plantType as PlantType] ?? '🌱'}
        </Text>
        <ThemedText type="smallBold" numberOfLines={1}>
          {friend.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {friend.tag}
          {friend.location ? ` · ${friend.location}` : ''}
        </ThemedText>
        <HealthBadge health={health} lowTouch={friend.lowTouch} compact />
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    padding: 12,
    borderRadius: 14,
    borderWidth: 2,
    gap: 4,
    minHeight: 100,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.85,
  },
  plant: {
    fontSize: 36,
    lineHeight: 40,
  },
});
