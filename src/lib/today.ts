import { computeHealth, daysBetween } from './health';

export interface TodayCandidateInput {
  friendId: string;
  createdAt: Date;
  cadenceDays: number;
  lowTouch: boolean;
  snoozeUntil: Date | null;
  lastContactAt: Date | null;
}

export interface TodayResult {
  friendId: string;
  health: 'NEW' | 'THIRSTY' | 'OKAY';
  /** Whole days past the cadence deadline. Null for NEW (no cadence to violate yet). */
  daysOverdue: number | null;
}

export function rankToday(input: TodayCandidateInput[], now: Date, limit = 5): TodayResult[] {
  const eligible = input
    .filter((candidate) => !candidate.lowTouch)
    .map((candidate) => {
      const health = computeHealth(
        {
          cadenceDays: candidate.cadenceDays,
          lowTouch: false,
          snoozeUntil: candidate.snoozeUntil,
          lastContactAt: candidate.lastContactAt,
        },
        now,
      );
      return { candidate, health };
    })
    .filter(
      (entry): entry is { candidate: TodayCandidateInput; health: 'NEW' | 'THIRSTY' | 'OKAY' } =>
        entry.health === 'NEW' || entry.health === 'THIRSTY' || entry.health === 'OKAY',
    );

  const newFriends = eligible
    .filter((entry) => entry.health === 'NEW')
    .sort((a, b) => a.candidate.createdAt.getTime() - b.candidate.createdAt.getTime());

  const overdue = eligible
    .filter((entry) => entry.health !== 'NEW')
    .sort((a, b) => {
      const ratioA = daysBetween(a.candidate.lastContactAt as Date, now) / a.candidate.cadenceDays;
      const ratioB = daysBetween(b.candidate.lastContactAt as Date, now) / b.candidate.cadenceDays;
      return ratioB - ratioA;
    });

  return [...newFriends, ...overdue].slice(0, limit).map(({ candidate, health }) => ({
    friendId: candidate.friendId,
    health,
    daysOverdue:
      health === 'NEW'
        ? null
        : Math.round(daysBetween(candidate.lastContactAt as Date, now) - candidate.cadenceDays),
  }));
}
