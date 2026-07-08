import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';

import * as schema from './schema';

const sqlite = SQLite.openDatabaseSync('friend_garden.db');

export const db = drizzle(sqlite, { schema });
