import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { getAllFriends } from '@/db/queries/friends';
import { getMostRecentLogTimestamp, getRecentActivity, type ActivityEntry } from '@/db/queries/contactLogs';
import { computeDashboardStats, type DashboardStats } from '@/lib/dashboard';
import { useStreak } from '@/hooks/useStreak';
import { useGardenStore } from '@/store/useGardenStore';

const EMPTY_STATS: DashboardStats = {
  totalFriends: 0,
  countsByHealth: { HAPPY: 0, OKAY: 0, THIRSTY: 0, RESTING: 0, NEW: 0 },
  healthyPercent: 0,
  byTag: {},
};

export function useDashboard() {
  const version = useGardenStore((state) => state.version);
  const { streak } = useStreak();
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const friends = await getAllFriends();
    const now = new Date();
    const inputs = await Promise.all(
      friends.map(async (friend) => ({
        tag: friend.tag,
        cadenceDays: friend.cadenceDays,
        lowTouch: friend.lowTouch,
        snoozeUntil: friend.snoozeUntil ? new Date(friend.snoozeUntil) : null,
        lastContactAt: await getMostRecentLogTimestamp(friend.id),
      })),
    );

    setStats(computeDashboardStats(inputs, now));
    setActivity(await getRecentActivity());
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

  return { stats, activity, streak, loading };
}
