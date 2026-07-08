import { buildBirthdayNotificationContent, getDayBefore } from './birthdayNotifications';

describe('buildBirthdayNotificationContent', () => {
  test('day-of copy interpolates the name', () => {
    const content = buildBirthdayNotificationContent('Hannah', 'day-of');
    expect(content.body).toContain('Hannah');
    expect(content.body.toLowerCase()).toContain('today');
  });

  test('day-before copy interpolates the name', () => {
    const content = buildBirthdayNotificationContent('Hannah', 'day-before');
    expect(content.body).toContain('Hannah');
    expect(content.body.toLowerCase()).toContain('tomorrow');
  });
});

describe('getDayBefore', () => {
  test('mid-month date just decrements the day', () => {
    expect(getDayBefore(6, 15)).toEqual({ month1Indexed: 6, day: 14 });
  });

  test('first-of-month non-January date rolls back to the previous month', () => {
    // March 1 -> Feb 28 (known leap-year gap: this is Feb 28 even in a leap year, accepted)
    expect(getDayBefore(3, 1)).toEqual({ month1Indexed: 2, day: 28 });
  });

  test('January 1 rolls back to December 31 of the (implicit) previous year', () => {
    expect(getDayBefore(1, 1)).toEqual({ month1Indexed: 12, day: 31 });
  });
});
