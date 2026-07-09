import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { getArchivedFriends, type FriendRow } from '@/db/queries/friends';
import { useGardenStore } from '@/store/useGardenStore';

export function useArchivedFriends() {
  const version = useGardenStore((state) => state.version);
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setFriends(await getArchivedFriends());
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

  return { friends, loading };
}
