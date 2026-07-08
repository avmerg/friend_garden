import * as Notifications from 'expo-notifications';

const NOTIFICATION_HOUR = 9;
const NOTIFICATION_MINUTE = 0;

const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function buildBirthdayNotificationContent(
  friendName: string,
  when: 'day-before' | 'day-of',
): { title: string; body: string } {
  if (when === 'day-of') {
    return { title: '🎂 Birthday today!', body: `It's ${friendName}'s birthday today!` };
  }
  return { title: '🎂 Birthday tomorrow', body: `${friendName}'s birthday is tomorrow!` };
}

/**
 * Pure date-math for "the day before" a month/day (both 1-indexed), handling month/year
 * rollover. Uses a static month-length table (Feb = 28) — a known, accepted gap for the
 * rare case of a Feb 29 or March 1 birthday in a leap year.
 */
export function getDayBefore(
  month1Indexed: number,
  day: number,
): { month1Indexed: number; day: number } {
  if (day > 1) {
    return { month1Indexed, day: day - 1 };
  }
  const previousMonth = month1Indexed === 1 ? 12 : month1Indexed - 1;
  return { month1Indexed: previousMonth, day: MONTH_LENGTHS[previousMonth - 1] };
}

function dayOfIdentifier(friendId: string): string {
  return `birthday-${friendId}-day-of`;
}

function dayBeforeIdentifier(friendId: string): string {
  return `birthday-${friendId}-day-before`;
}

export async function scheduleBirthdayNotifications(friend: {
  id: string;
  name: string;
  birthdayMonth: number;
  birthdayDay: number;
}): Promise<void> {
  await cancelBirthdayNotifications(friend.id);

  const dayOfContent = buildBirthdayNotificationContent(friend.name, 'day-of');
  await Notifications.scheduleNotificationAsync({
    identifier: dayOfIdentifier(friend.id),
    content: dayOfContent,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.YEARLY,
      month: friend.birthdayMonth - 1,
      day: friend.birthdayDay,
      hour: NOTIFICATION_HOUR,
      minute: NOTIFICATION_MINUTE,
    },
  });

  const before = getDayBefore(friend.birthdayMonth, friend.birthdayDay);
  const dayBeforeContent = buildBirthdayNotificationContent(friend.name, 'day-before');
  await Notifications.scheduleNotificationAsync({
    identifier: dayBeforeIdentifier(friend.id),
    content: dayBeforeContent,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.YEARLY,
      month: before.month1Indexed - 1,
      day: before.day,
      hour: NOTIFICATION_HOUR,
      minute: NOTIFICATION_MINUTE,
    },
  });
}

export async function cancelBirthdayNotifications(friendId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(dayOfIdentifier(friendId)).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(dayBeforeIdentifier(friendId)).catch(() => {});
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}
