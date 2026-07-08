import { rankToday, type TodayCandidateInput } from './today';

const NOW = new Date('2026-07-07T12:00:00.000Z');

function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
}

function candidate(overrides: Partial<TodayCandidateInput> & { friendId: string }): TodayCandidateInput {
  return {
    createdAt: daysAgo(365),
    cadenceDays: 30,
    lowTouch: false,
    snoozeUntil: null,
    lastContactAt: daysAgo(5),
    ...overrides,
  };
}

describe('rankToday', () => {
  test('empty input -> empty output', () => {
    expect(rankToday([], NOW)).toEqual([]);
  });

  test('excludes HAPPY friends', () => {
    const result = rankToday([candidate({ friendId: 'happy', lastContactAt: daysAgo(1) })], NOW);
    expect(result).toEqual([]);
  });

  test('excludes RESTING (snoozed) friends even if badly overdue', () => {
    const result = rankToday(
      [
        candidate({
          friendId: 'resting',
          lastContactAt: daysAgo(200),
          snoozeUntil: new Date(NOW.getTime() + 5 * 24 * 60 * 60 * 1000),
        }),
      ],
      NOW,
    );
    expect(result).toEqual([]);
  });

  test('excludes low_touch friends who would otherwise be NEW', () => {
    const result = rankToday(
      [candidate({ friendId: 'low-touch-new', lowTouch: true, lastContactAt: null })],
      NOW,
    );
    expect(result).toEqual([]);
  });

  test('excludes low_touch friends who would otherwise be THIRSTY', () => {
    const result = rankToday(
      [candidate({ friendId: 'low-touch-overdue', lowTouch: true, cadenceDays: 14, lastContactAt: daysAgo(1000) })],
      NOW,
    );
    expect(result).toEqual([]);
  });

  test('includes THIRSTY and OKAY friends', () => {
    const result = rankToday(
      [
        candidate({ friendId: 'thirsty', cadenceDays: 14, lastContactAt: daysAgo(40) }),
        candidate({ friendId: 'okay', cadenceDays: 30, lastContactAt: daysAgo(28) }),
      ],
      NOW,
    );
    expect(result.map((r) => r.friendId).sort()).toEqual(['okay', 'thirsty']);
  });

  test('THIRSTY is ranked ahead of OKAY', () => {
    const result = rankToday(
      [
        candidate({ friendId: 'okay', cadenceDays: 30, lastContactAt: daysAgo(28) }),
        candidate({ friendId: 'thirsty', cadenceDays: 14, lastContactAt: daysAgo(40) }),
      ],
      NOW,
    );
    expect(result.map((r) => r.friendId)).toEqual(['thirsty', 'okay']);
  });

  test('multiple NEW friends are sorted oldest-created-first', () => {
    const result = rankToday(
      [
        candidate({ friendId: 'new-recent', lastContactAt: null, createdAt: daysAgo(1) }),
        candidate({ friendId: 'new-oldest', lastContactAt: null, createdAt: daysAgo(100) }),
        candidate({ friendId: 'new-middle', lastContactAt: null, createdAt: daysAgo(50) }),
      ],
      NOW,
    );
    expect(result.map((r) => r.friendId)).toEqual(['new-oldest', 'new-middle', 'new-recent']);
  });

  test('NEW friends are ranked ahead of THIRSTY/OKAY friends', () => {
    const result = rankToday(
      [
        candidate({ friendId: 'thirsty', cadenceDays: 14, lastContactAt: daysAgo(40) }),
        candidate({ friendId: 'new', lastContactAt: null, createdAt: daysAgo(10) }),
      ],
      NOW,
    );
    expect(result.map((r) => r.friendId)).toEqual(['new', 'thirsty']);
  });

  test('caps the result at the given limit', () => {
    const candidates = Array.from({ length: 8 }, (_, i) =>
      candidate({ friendId: `overdue-${i}`, cadenceDays: 14, lastContactAt: daysAgo(20 + i) }),
    );
    const result = rankToday(candidates, NOW, 5);
    expect(result).toHaveLength(5);
  });

  test('daysOverdue is null for NEW and a number for THIRSTY/OKAY', () => {
    const result = rankToday(
      [
        candidate({ friendId: 'new', lastContactAt: null }),
        candidate({ friendId: 'thirsty', cadenceDays: 14, lastContactAt: daysAgo(20) }),
      ],
      NOW,
    );
    const newResult = result.find((r) => r.friendId === 'new');
    const thirstyResult = result.find((r) => r.friendId === 'thirsty');
    expect(newResult?.daysOverdue).toBeNull();
    expect(thirstyResult?.daysOverdue).toBe(6);
  });
});
