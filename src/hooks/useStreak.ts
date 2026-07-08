import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { getAllContactTimestamps } from '@/db/queries/contactLogs';
import { computeStreak } from '@/lib/streak';
import { useGardenStore } from '@/store/useGardenStore';

export function useStreak() {
  const version = useGardenStore((state) => state.version);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const timestamps = await getAllContactTimestamps();
    setStreak(computeStreak(timestamps, new Date()));
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

  return { streak, loading };
}
