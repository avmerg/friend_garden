function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function computeStreak(logTimestamps: Date[], now: Date): number {
  const days = new Set(logTimestamps.map(localDateKey));

  let cursor: Date;
  if (days.has(localDateKey(now))) {
    cursor = now;
  } else if (days.has(localDateKey(addDays(now, -1)))) {
    cursor = addDays(now, -1);
  } else {
    return 0;
  }

  let streak = 0;
  while (days.has(localDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
