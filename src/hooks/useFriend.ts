import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { getFriendById, type FriendRow } from '../db/queries/friends';
import { getRecentLogs, getMostRecentLogTimestamp, type ContactLogRow } from '../db/queries/contactLogs';
import { computeHealth, type HealthStatus } from '../lib/health';
import { useGardenStore } from '../store/useGardenStore';

export function useFriend(id: string) {
  const version = useGardenStore((state) => state.version);
  const [friend, setFriend] = useState<FriendRow | null>(null);
  const [logs, setLogs] = useState<ContactLogRow[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [friendRow, recentLogs, lastContactAt] = await Promise.all([
      getFriendById(id),
      getRecentLogs(id),
      getMostRecentLogTimestamp(id),
    ]);
    setFriend(friendRow);
    setLogs(recentLogs);
    if (friendRow) {
      setHealth(
        computeHealth(
          {
            cadenceDays: friendRow.cadenceDays,
            lowTouch: friendRow.lowTouch,
            snoozeUntil: friendRow.snoozeUntil ? new Date(friendRow.snoozeUntil) : null,
            lastContactAt,
          },
          new Date(),
        ),
      );
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load, version]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { friend, logs, health, loading, refetch: load };
}
