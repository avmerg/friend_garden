export type HealthStatus = 'HAPPY' | 'OKAY' | 'THIRSTY' | 'RESTING' | 'NEW';

export interface HealthInput {
  cadenceDays: number;
  lowTouch: boolean;
  snoozeUntil: Date | null;
  lastContactAt: Date | null;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function daysBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / MS_PER_DAY;
}

export function computeHealth(input: HealthInput, now: Date): HealthStatus {
  if (input.snoozeUntil && input.snoozeUntil > now) {
    return 'RESTING';
  }

  if (input.lastContactAt === null) {
    return 'NEW';
  }

  const ratio = daysBetween(input.lastContactAt, now) / input.cadenceDays;

  if (input.lowTouch) {
    return ratio <= 1.0 ? 'HAPPY' : 'OKAY';
  }

  if (ratio <= 0.75) return 'HAPPY';
  if (ratio <= 1.0) return 'OKAY';
  return 'THIRSTY';
}

export const HEALTH_COLORS: Record<HealthStatus, string> = {
  HAPPY: '#7CB342',
  OKAY: '#F4B942',
  THIRSTY: '#E4572E',
  RESTING: '#90A4AE',
  NEW: '#C9B896',
};

export const HEALTH_LABELS: Record<HealthStatus, string> = {
  HAPPY: 'Happy',
  OKAY: 'Due soon',
  THIRSTY: 'Thirsty',
  RESTING: 'Resting',
  NEW: 'New',
};
