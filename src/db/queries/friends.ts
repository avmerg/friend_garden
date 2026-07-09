import { randomUUID } from 'expo-crypto';
import { eq } from 'drizzle-orm';

import { db } from '../client';
import { friends } from '../schema';
import { TAG_TO_PLANT_TYPE_DEFAULT, type Tag, type PlantType, type CadenceDays } from '../../lib/constants';

export type FriendRow = typeof friends.$inferSelect;

export interface NewFriendInput {
  name: string;
  tag: Tag;
  cadenceDays: CadenceDays;
  plantType?: PlantType;
  phone?: string;
  email?: string;
  bio?: string;
  birthdayMonth?: number;
  birthdayDay?: number;
  birthdayYear?: number;
  location?: string;
  lowTouch?: boolean;
}

export async function getAllFriends(): Promise<FriendRow[]> {
  return db.select().from(friends).where(eq(friends.archived, false));
}

export async function getArchivedFriends(): Promise<FriendRow[]> {
  return db.select().from(friends).where(eq(friends.archived, true));
}

export async function getFriendById(id: string): Promise<FriendRow | null> {
  const rows = await db.select().from(friends).where(eq(friends.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createFriend(input: NewFriendInput): Promise<FriendRow> {
  const now = new Date().toISOString();
  const row: typeof friends.$inferInsert = {
    id: randomUUID(),
    name: input.name,
    tag: input.tag,
    plantType: input.plantType ?? TAG_TO_PLANT_TYPE_DEFAULT[input.tag],
    cadenceDays: input.cadenceDays,
    phone: input.phone ?? null,
    email: input.email ?? null,
    bio: input.bio ?? null,
    birthdayMonth: input.birthdayMonth ?? null,
    birthdayDay: input.birthdayDay ?? null,
    birthdayYear: input.birthdayYear ?? null,
    location: input.location ?? null,
    lowTouch: input.lowTouch ?? false,
    snoozeUntil: null,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(friends).values(row);
  return row as FriendRow;
}

export async function updateFriend(
  id: string,
  patch: Partial<Omit<FriendRow, 'id' | 'createdAt'>>,
): Promise<void> {
  await db
    .update(friends)
    .set({ ...patch, updatedAt: new Date().toISOString() })
    .where(eq(friends.id, id));
}

export async function archiveFriend(id: string): Promise<void> {
  await updateFriend(id, { archived: true });
}

export async function unarchiveFriend(id: string): Promise<void> {
  await updateFriend(id, { archived: false });
}
