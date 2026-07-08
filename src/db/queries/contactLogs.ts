import { randomUUID } from 'expo-crypto';
import { desc, eq } from 'drizzle-orm';

import { db } from '../client';
import { contactLogs, friends } from '../schema';
import type { Direction, Channel } from '../../lib/constants';

export type ContactLogRow = typeof contactLogs.$inferSelect;

export async function insertContactLog(params: {
  friendId: string;
  direction: Direction;
  channel?: Channel;
  note?: string;
  timestamp?: Date;
}): Promise<ContactLogRow> {
  const now = new Date();
  const row: typeof contactLogs.$inferInsert = {
    id: randomUUID(),
    friendId: params.friendId,
    timestamp: (params.timestamp ?? now).toISOString(),
    direction: params.direction,
    channel: params.channel ?? null,
    note: params.note ?? null,
    createdAt: now.toISOString(),
  };
  await db.insert(contactLogs).values(row);
  return row as ContactLogRow;
}

export async function deleteContactLog(id: string): Promise<void> {
  await db.delete(contactLogs).where(eq(contactLogs.id, id));
}

export async function getRecentLogs(friendId: string, limit = 20): Promise<ContactLogRow[]> {
  return db
    .select()
    .from(contactLogs)
    .where(eq(contactLogs.friendId, friendId))
    .orderBy(desc(contactLogs.timestamp))
    .limit(limit);
}

export async function getMostRecentLogTimestamp(friendId: string): Promise<Date | null> {
  const rows = await db
    .select({ timestamp: contactLogs.timestamp })
    .from(contactLogs)
    .where(eq(contactLogs.friendId, friendId))
    .orderBy(desc(contactLogs.timestamp))
    .limit(1);
  return rows[0] ? new Date(rows[0].timestamp) : null;
}

export async function getAllContactTimestamps(): Promise<Date[]> {
  const rows = await db.select({ timestamp: contactLogs.timestamp }).from(contactLogs);
  return rows.map((row) => new Date(row.timestamp));
}

export interface ActivityEntry {
  id: string;
  friendName: string;
  direction: string;
  timestamp: string;
}

export async function getRecentActivity(limit = 20): Promise<ActivityEntry[]> {
  const rows = await db
    .select({
      id: contactLogs.id,
      friendName: friends.name,
      direction: contactLogs.direction,
      timestamp: contactLogs.timestamp,
    })
    .from(contactLogs)
    .innerJoin(friends, eq(contactLogs.friendId, friends.id))
    .orderBy(desc(contactLogs.timestamp))
    .limit(limit);
  return rows;
}
