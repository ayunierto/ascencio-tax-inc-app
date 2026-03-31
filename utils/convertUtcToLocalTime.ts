import { DateTime } from 'luxon';

/**
 * Converts a UTC date string to a formatted time string in a specified timezone.
 *
 * @param utcDate The ISO 8601 date string in UTC (e.g., "2023-10-27T18:00:00.000Z").
 * @param timeZone The target IANA time zone identifier (e.g., 'America/New_York', 'Europe/Madrid').
 * @param format The desired output time format. Defaults to '12'.
 * - '12-hour': 12-hour format with AM/PM (e.g., "6:00 PM").
 * - '24-hour': 24-hour format (e.g., "18:00").
 * @returns The formatted time string in the specified timezone.
 *
 * @example
 * // returns "2:00 PM"
 * convertUtcDateToLocalTime("2023-10-27T18:00:00.000Z", "America/New_York", "12-hour");
 *
 * @example
 * // returns "18:00"
 * convertUtcDateToLocalTime("2023-10-27T18:00:00.000Z", "Europe/Madrid", "24-hour");
 */
export const convertUtcDateToLocalTime = (
  utcDate: string,
  timeZone: string,
  format: '12-hour' | '24-hour' = '12-hour'
) => {
  const formatString = format === '12-hour' ? 'hh:mm a' : 'HH:mm';
  return DateTime.fromISO(utcDate, { zone: 'utc' })
    .setZone(timeZone)
    .toFormat(formatString);
};
