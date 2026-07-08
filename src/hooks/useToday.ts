import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { getAllFriends, type FriendRow } from '@/db/queries/friends';
import { getMostRecentLogTimestamp } from '@/db/queries/contactLogs';
import { rankToday, type TodayResult } from '@/lib/today';
import { useGardenStore } from '@/store/useGardenStore';

export interface TodayItem {
  friend: FriendRow;
  result: TodayResult;
}

export function useToday() {
  const version = useGardenStore((state) => state.version);
  const [items, setItems] = useState<TodayItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const friends = await getAllFriends();
    const now = new Date();
    const candidates = await Promise.all(
      friends.map(async (friend) => ({
        friendId: friend.id,
        createdAt: new Date(friend.createdAt),
        cadenceDays: friend.cadenceDays,
        lowTouch: friend.lowTouch,
        snoozeUntil: friend.snoozeUntil ? new Date(friend.snoozeUntil) : null,
        lastContactAt: await getMostRecentLogTimestamp(friend.id),
      })),
    );

    const ranked = rankToday(candidates, now);
    const friendById = new Map(friends.map((friend) => [friend.id, friend]));
    const rankedItems = ranked
      .map((result) => {
        const friend = friendById.get(result.friendId);
        return friend ? { friend, result } : null;
      })
      .filter((item): item is TodayItem => item !== null);

    setItems(rankedItems);
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

  return { items, loading, refetch: load };
}
