import { eq } from 'drizzle-orm';

import { db } from './client';
import { meta } from './schema';
import { createFriend, updateFriend } from './queries/friends';
import { insertContactLog } from './queries/contactLogs';
import type { Tag, PlantType, CadenceDays } from '../lib/constants';

import sampleContacts from './seed/contacts.seed.sample.json';

const SEEDED_AT_KEY = 'seeded_at';

interface SeedFriendRow {
  name: string;
  tag: Tag;
  cadenceDays: CadenceDays;
  plantType?: PlantType;
  phone?: string;
  email?: string;
  bio?: string;
  location?: string;
  birthdayMonth?: number;
  birthdayDay?: number;
  birthdayYear?: number;
  lowTouch?: boolean;
  /** Seed-only hint: back-dates a synthetic contact log so the friend renders with a realistic health state. */
  seedLastContactDaysAgo?: number;
  /** Seed-only hint: sets snooze_until into the future so the friend renders RESTING. */
  seedSnoozeDaysFromNow?: number;
}

const SEED_SOURCE = sampleContacts as SeedFriendRow[];

async function getMeta(key: string): Promise<string | null> {
  const rows = await db.select().from(meta).where(eq(meta.key, key)).limit(1);
  return rows[0]?.value ?? null;
}

async function setMeta(key: string, value: string): Promise<void> {
  await db.insert(meta).values({ key, value }).onConflictDoUpdate({ target: meta.key, set: { value } });
}

export async function seedIfEmpty(): Promise<void> {
  const alreadySeeded = await getMeta(SEEDED_AT_KEY);
  if (alreadySeeded) return;

  for (const seedRow of SEED_SOURCE) {
    const friend = await createFriend({
      name: seedRow.name,
      tag: seedRow.tag,
      cadenceDays: seedRow.cadenceDays,
      plantType: seedRow.plantType,
      phone: seedRow.phone,
      email: seedRow.email,
      bio: seedRow.bio,
      location: seedRow.location,
      birthdayMonth: seedRow.birthdayMonth,
      birthdayDay: seedRow.birthdayDay,
      birthdayYear: seedRow.birthdayYear,
      lowTouch: seedRow.lowTouch,
    });

    if (seedRow.seedLastContactDaysAgo !== undefined) {
      const timestamp = new Date(Date.now() - seedRow.seedLastContactDaysAgo * 24 * 60 * 60 * 1000);
      await insertContactLog({ friendId: friend.id, direction: 'outbound', timestamp });
    }

    if (seedRow.seedSnoozeDaysFromNow !== undefined) {
      const snoozeUntil = new Date(Date.now() + seedRow.seedSnoozeDaysFromNow * 24 * 60 * 60 * 1000);
      await updateFriend(friend.id, { snoozeUntil: snoozeUntil.toISOString() });
    }
  }

  await setMeta(SEEDED_AT_KEY, new Date().toISOString());
}
