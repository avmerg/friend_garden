import { useCallback } from 'react';

import { updateFriend, type FriendRow } from '@/db/queries/friends';
import { useGardenStore } from '@/store/useGardenStore';

export function useUpdateFriend() {
  const bump = useGardenStore((state) => state.bump);

  return useCallback(
    async (id: string, patch: Partial<Omit<FriendRow, 'id' | 'createdAt'>>) => {
      await updateFriend(id, patch);
      bump();
    },
    [bump],
  );
}
