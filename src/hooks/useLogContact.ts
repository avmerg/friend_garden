import { useCallback } from 'react';

import { insertContactLog, deleteContactLog, type ContactLogRow } from '@/db/queries/contactLogs';
import { useGardenStore } from '@/store/useGardenStore';
import type { Direction } from '@/lib/constants';

export function useLogContact() {
  const bump = useGardenStore((state) => state.bump);

  const logContact = useCallback(
    async (friendId: string, direction: Direction): Promise<ContactLogRow> => {
      const row = await insertContactLog({ friendId, direction });
      bump();
      return row;
    },
    [bump],
  );

  const undoLogContact = useCallback(
    async (logId: string) => {
      await deleteContactLog(logId);
      bump();
    },
    [bump],
  );

  return { logContact, undoLogContact };
}
