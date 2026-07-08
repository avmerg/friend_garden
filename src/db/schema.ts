import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const friends = sqliteTable('friends', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  tag: text('tag').notNull(),
  plantType: text('plant_type').notNull(),
  cadenceDays: integer('cadence_days').notNull(),
  phone: text('phone'),
  email: text('email'),
  bio: text('bio'),
  birthdayMonth: integer('birthday_month'),
  birthdayDay: integer('birthday_day'),
  birthdayYear: integer('birthday_year'),
  location: text('location'),
  lowTouch: integer('low_touch', { mode: 'boolean' }).notNull().default(false),
  snoozeUntil: text('snooze_until'),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const contactLogs = sqliteTable(
  'contact_logs',
  {
    id: text('id').primaryKey(),
    friendId: text('friend_id')
      .notNull()
      .references(() => friends.id),
    timestamp: text('timestamp').notNull(),
    direction: text('direction').notNull(),
    channel: text('channel'),
    note: text('note'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('idx_contact_logs_friend_ts').on(table.friendId, table.timestamp)],
);

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  friendId: text('friend_id')
    .notNull()
    .references(() => friends.id),
  body: text('body').notNull(),
  tag: text('tag'),
  createdAt: text('created_at').notNull(),
});

export const meta = sqliteTable('meta', {
  key: text('key').primaryKey(),
  value: text('value'),
});
