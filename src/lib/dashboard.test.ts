import { computeDashboardStats, type DashboardFriendInput } from './dashboard';
import { TAGS } from './constants';

const NOW = new Date('2026-07-07T12:00:00.000Z');

function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
}

function friend(overrides: Partial<DashboardFriendInput> = {}): DashboardFriendInput {
  return {
    tag: 'Friend',
    cadenceDays: 30,
    lowTouch: false,
    snoozeUntil: null,
    lastContactAt: daysAgo(5),
    ...overrides,
  };
}

describe('computeDashboardStats', () => {
  test('empty input -> 0 total, 0%, all tags zero-filled', () => {
    const stats = computeDashboardStats([], NOW);
    expect(stats.totalFriends).toBe(0);
    expect(stats.healthyPercent).toBe(0);
    for (const tag of TAGS) {
      expect(stats.byTag[tag].total).toBe(0);
      expect(stats.byTag[tag].notThirstyPercent).toBe(0);
    }
  });

  test('all HAPPY -> 100%', () => {
    const stats = computeDashboardStats(
      [friend({ lastContactAt: daysAgo(1) }), friend({ lastContactAt: daysAgo(2) })],
      NOW,
    );
    expect(stats.healthyPercent).toBe(100);
    expect(stats.countsByHealth.HAPPY).toBe(2);
  });

  test('all THIRSTY -> 0%', () => {
    const stats = computeDashboardStats(
      [
        friend({ cadenceDays: 14, lastContactAt: daysAgo(40) }),
        friend({ cadenceDays: 14, lastContactAt: daysAgo(50) }),
      ],
      NOW,
    );
    expect(stats.healthyPercent).toBe(0);
    expect(stats.countsByHealth.THIRSTY).toBe(2);
  });

  test('RESTING counts toward the healthy numerator', () => {
    const stats = computeDashboardStats(
      [
        friend({
          cadenceDays: 14,
          lastContactAt: daysAgo(200),
          snoozeUntil: new Date(NOW.getTime() + 5 * 24 * 60 * 60 * 1000),
        }),
      ],
      NOW,
    );
    expect(stats.countsByHealth.RESTING).toBe(1);
    expect(stats.healthyPercent).toBe(100);
  });

  test('NEW does not count toward the healthy numerator', () => {
    const stats = computeDashboardStats([friend({ lastContactAt: null })], NOW);
    expect(stats.countsByHealth.NEW).toBe(1);
    expect(stats.healthyPercent).toBe(0);
  });

  test('mixed set exercises rounding', () => {
    // 1 happy, 1 thirsty out of 3 -> not evenly divisible
    const stats = computeDashboardStats(
      [
        friend({ lastContactAt: daysAgo(1) }),
        friend({ cadenceDays: 14, lastContactAt: daysAgo(40) }),
        friend({ lastContactAt: null }),
      ],
      NOW,
    );
    expect(stats.totalFriends).toBe(3);
    expect(stats.healthyPercent).toBe(Math.round((100 * 1) / 3));
  });

  test('per-tag bucketing sums correctly and a zero-friend tag returns 0% not NaN', () => {
    const stats = computeDashboardStats(
      [
        friend({ tag: 'Work', lastContactAt: daysAgo(1) }),
        friend({ tag: 'Work', cadenceDays: 14, lastContactAt: daysAgo(40) }),
        friend({ tag: 'Family', lastContactAt: daysAgo(1) }),
      ],
      NOW,
    );
    expect(stats.byTag.Work.total).toBe(2);
    expect(stats.byTag.Work.notThirstyPercent).toBe(50);
    expect(stats.byTag.Family.total).toBe(1);
    expect(stats.byTag.Family.notThirstyPercent).toBe(100);
    expect(stats.byTag.College.total).toBe(0);
    expect(stats.byTag.College.notThirstyPercent).toBe(0);
  });
});
