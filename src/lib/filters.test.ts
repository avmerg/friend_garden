import { applyGardenFilters } from './filters';
import type { FriendWithHealth } from '@/hooks/useFriends';
import type { FriendRow } from '@/db/queries/friends';

function friend(overrides: Partial<FriendRow> & { id: string }): FriendRow {
  return {
    name: 'Test',
    tag: 'Friend',
    plantType: 'sunflower',
    cadenceDays: 30,
    phone: null,
    email: null,
    bio: null,
    birthdayMonth: null,
    birthdayDay: null,
    birthdayYear: null,
    location: null,
    lowTouch: false,
    snoozeUntil: null,
    archived: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as FriendRow;
}

const ITEMS: FriendWithHealth[] = [
  { friend: friend({ id: 'a', tag: 'Work' }), health: 'HAPPY' },
  { friend: friend({ id: 'b', tag: 'Family' }), health: 'THIRSTY' },
  { friend: friend({ id: 'c', tag: 'Work' }), health: 'THIRSTY' },
];

describe('applyGardenFilters', () => {
  test('empty selections return everyone ("All")', () => {
    expect(applyGardenFilters(ITEMS, [], [])).toHaveLength(3);
  });

  test('filters by tag only', () => {
    const result = applyGardenFilters(ITEMS, ['Work'], []);
    expect(result.map((r) => r.friend.id).sort()).toEqual(['a', 'c']);
  });

  test('filters by status only', () => {
    const result = applyGardenFilters(ITEMS, [], ['THIRSTY']);
    expect(result.map((r) => r.friend.id).sort()).toEqual(['b', 'c']);
  });

  test('combines tag and status with AND logic', () => {
    const result = applyGardenFilters(ITEMS, ['Work'], ['THIRSTY']);
    expect(result.map((r) => r.friend.id)).toEqual(['c']);
  });
});
