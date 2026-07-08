/// <reference types="jest" />

import { computeHealth, type HealthInput, type HealthStatus } from './health';

const NOW = new Date('2026-07-07T12:00:00.000Z');

function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
}

function daysFromNow(days: number): Date {
  return new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000);
}

function baseInput(overrides: Partial<HealthInput> = {}): HealthInput {
  return {
    cadenceDays: 100,
    lowTouch: false,
    snoozeUntil: null,
    lastContactAt: daysAgo(0),
    ...overrides,
  };
}

describe('computeHealth', () => {
  test('NEW: never contacted, regardless of other fields', () => {
    const input = baseInput({ lastContactAt: null });
    expect(computeHealth(input, NOW)).toBe<HealthStatus>('NEW');
  });

  test('HAPPY: well within cadence (ratio well below 0.75)', () => {
    const input = baseInput({ cadenceDays: 100, lastContactAt: daysAgo(10) });
    expect(computeHealth(input, NOW)).toBe<HealthStatus>('HAPPY');
  });

  test('HAPPY: exactly at the 0.75 boundary (inclusive)', () => {
    const input = baseInput({ cadenceDays: 100, lastContactAt: daysAgo(75) });
    expect(computeHealth(input, NOW)).toBe<HealthStatus>('HAPPY');
  });

  test('OKAY: just past the 0.75 boundary', () => {
    const input = baseInput({ cadenceDays: 100, lastContactAt: daysAgo(76) });
    expect(computeHealth(input, NOW)).toBe<HealthStatus>('OKAY');
  });

  test('OKAY: exactly at the 1.0 boundary (inclusive)', () => {
    const input = baseInput({ cadenceDays: 100, lastContactAt: daysAgo(100) });
    expect(computeHealth(input, NOW)).toBe<HealthStatus>('OKAY');
  });

  test('THIRSTY: just past the 1.0 boundary', () => {
    const input = baseInput({ cadenceDays: 100, lastContactAt: daysAgo(101) });
    expect(computeHealth(input, NOW)).toBe<HealthStatus>('THIRSTY');
  });

  test('THIRSTY: badly overdue', () => {
    const input = baseInput({ cadenceDays: 30, lastContactAt: daysAgo(200) });
    expect(computeHealth(input, NOW)).toBe<HealthStatus>('THIRSTY');
  });

  test('RESTING: snoozed into the future takes priority over an otherwise THIRSTY friend', () => {
    const input = baseInput({
      cadenceDays: 30,
      lastContactAt: daysAgo(200),
      snoozeUntil: daysFromNow(5),
    });
    expect(computeHealth(input, NOW)).toBe<HealthStatus>('RESTING');
  });

  test('RESTING: takes priority even over NEW (never contacted, but snoozed)', () => {
    const input = baseInput({ lastContactAt: null, snoozeUntil: daysFromNow(1) });
    expect(computeHealth(input, NOW)).toBe<HealthStatus>('RESTING');
  });

  test('not RESTING: snooze_until in the past is expired and ignored', () => {
    const input = baseInput({
      cadenceDays: 100,
      lastContactAt: daysAgo(10),
      snoozeUntil: daysAgo(1),
    });
    expect(computeHealth(input, NOW)).toBe<HealthStatus>('HAPPY');
  });

  test('low_touch: caps at HAPPY when ratio <= 1.0', () => {
    const input = baseInput({ cadenceDays: 30, lastContactAt: daysAgo(30), lowTouch: true });
    expect(computeHealth(input, NOW)).toBe<HealthStatus>('HAPPY');
  });

  test('low_touch: caps at OKAY when overdue, never THIRSTY', () => {
    const input = baseInput({ cadenceDays: 30, lastContactAt: daysAgo(31), lowTouch: true });
    expect(computeHealth(input, NOW)).toBe<HealthStatus>('OKAY');
  });

  test('low_touch: caps at OKAY even when extremely overdue', () => {
    const input = baseInput({ cadenceDays: 14, lastContactAt: daysAgo(1000), lowTouch: true });
    expect(computeHealth(input, NOW)).toBe<HealthStatus>('OKAY');
  });
});
