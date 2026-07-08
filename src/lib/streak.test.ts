import { computeStreak } from './streak';

function at(y: number, m: number, d: number, h = 12, min = 0): Date {
  return new Date(y, m, d, h, min, 0, 0);
}

describe('computeStreak', () => {
  test('0 logs -> 0', () => {
    const now = at(2026, 6, 7);
    expect(computeStreak([], now)).toBe(0);
  });

  test('a log today only -> 1', () => {
    const now = at(2026, 6, 7, 18);
    expect(computeStreak([at(2026, 6, 7, 9)], now)).toBe(1);
  });

  test('3 consecutive days including today -> 3', () => {
    const now = at(2026, 6, 7);
    const logs = [at(2026, 6, 7), at(2026, 6, 6), at(2026, 6, 5)];
    expect(computeStreak(logs, now)).toBe(3);
  });

  test('nothing logged today yet, but yesterday was logged -> 1 (not broken)', () => {
    const now = at(2026, 6, 7, 6); // early morning, hasn't watered anyone yet today
    const logs = [at(2026, 6, 6, 20)];
    expect(computeStreak(logs, now)).toBe(1);
  });

  test('gap yesterday (only 2 days ago logged) -> 0, streak is broken', () => {
    const now = at(2026, 6, 7);
    const logs = [at(2026, 6, 5)];
    expect(computeStreak(logs, now)).toBe(0);
  });

  test('duplicate same-day logs count once toward the streak length', () => {
    const now = at(2026, 6, 7);
    const logs = [at(2026, 6, 7, 9), at(2026, 6, 7, 14), at(2026, 6, 7, 20), at(2026, 6, 6, 10)];
    expect(computeStreak(logs, now)).toBe(2);
  });

  test('a mutual-direction contact still counts (the function only cares about the timestamp)', () => {
    // direction is resolved before conversion to Date; a "mutual" log's timestamp is
    // indistinguishable from any other once it reaches this pure function.
    const now = at(2026, 6, 7);
    expect(computeStreak([at(2026, 6, 7)], now)).toBe(1);
  });

  test('crosses a month boundary correctly', () => {
    const now = at(2026, 6, 1); // July 1
    const logs = [at(2026, 6, 1), at(2026, 5, 30)]; // Jul 1, Jun 30
    expect(computeStreak(logs, now)).toBe(2);
  });

  test('crosses a year boundary correctly', () => {
    const now = at(2026, 0, 1); // Jan 1, 2026
    const logs = [at(2026, 0, 1), at(2025, 11, 31)]; // Dec 31, 2025
    expect(computeStreak(logs, now)).toBe(2);
  });

  test('a late-night local-time log is not misattributed to the next UTC day', () => {
    // 11:30pm local time — if this were bucketed via toISOString() in a UTC+ timezone
    // offset scenario it could shift to the next calendar day. Using local getters avoids that.
    const now = at(2026, 6, 8);
    const logs = [at(2026, 6, 7, 23, 30), at(2026, 6, 8, 0, 30)];
    expect(computeStreak(logs, now)).toBe(2);
  });
});
