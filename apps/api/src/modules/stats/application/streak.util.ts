const DAY_MS = 86_400_000;

function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Current consecutive-day streak from a set of activity dates (UTC YYYY-MM-DD).
 * A one-day grace applies: if there's no activity today but there was yesterday,
 * the streak still counts (it only breaks after a full missed day).
 */
export function computeStreak(activityDates: string[], now: Date): number {
  if (activityDates.length === 0) return 0;
  const days = new Set(activityDates);

  let cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const today = utcDateKey(cursor);
  const yesterday = utcDateKey(new Date(cursor.getTime() - DAY_MS));

  if (!days.has(today) && !days.has(yesterday)) return 0;
  if (!days.has(today)) cursor = new Date(cursor.getTime() - DAY_MS);

  let streak = 0;
  while (days.has(utcDateKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}
