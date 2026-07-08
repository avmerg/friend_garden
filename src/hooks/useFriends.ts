import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { getAllFriends, type FriendRow } from '../db/queries/friends';
import { getMostRecentLogTimestamp } from '../db/queries/contactLogs';
import { computeHealth, type HealthStatus } from '../lib/health';
import { useGardenStore } from '../store/useGardenStore';

export interface FriendWithHealth {
  friend: FriendRow;
  health: HealthStatus;
}

export function useFriends() {
  const version = useGardenStore((state) => state.version);
  const [friends, setFriends] = useState<FriendWithHealth[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const rows = await getAllFriends();
    const now = new Date();
    const withHealth = await Promise.all(
      rows.map(async (friend) => {
        const lastContactAt = await getMostRecentLogTimestamp(friend.id);
        const health = computeHealth(
          {
            cadenceDays: friend.cadenceDays,
            lowTouch: friend.lowTouch,
            snoozeUntil: friend.snoozeUntil ? new Date(friend.snoozeUntil) : null,
            lastContactAt,
          },
          now,
        );
        return { friend, health };
      }),
    );
    setFriends(withHealth);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load, version]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { friends, loading, refetch: load };
}
