import { useCallback } from 'react';

import { archiveFriend, unarchiveFriend, type FriendRow } from '@/db/queries/friends';
import {
  cancelBirthdayNotifications,
  ensureNotificationPermission,
  scheduleBirthdayNotifications,
} from '@/lib/birthdayNotifications';
import { useGardenStore } from '@/store/useGardenStore';

export function useArchiveFriend() {
  const bump = useGardenStore((state) => state.bump);

  const archive = useCallback(
    async (friend: FriendRow) => {
      await archiveFriend(friend.id);
      await cancelBirthdayNotifications(friend.id);
      bump();
    },
    [bump],
  );

  const unarchive = useCallback(
    async (friend: FriendRow) => {
      await unarchiveFriend(friend.id);
      if (friend.birthdayMonth && friend.birthdayDay) {
        const granted = await ensureNotificationPermission();
        if (granted) {
          await scheduleBirthdayNotifications({
            id: friend.id,
            name: friend.name,
            birthdayMonth: friend.birthdayMonth,
            birthdayDay: friend.birthdayDay,
          });
        }
      }
      bump();
    },
    [bump],
  );

  return { archive, unarchive };
}
