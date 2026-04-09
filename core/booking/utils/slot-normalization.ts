import { DateTime } from 'luxon';

import type { AvailableSlot } from '../interfaces/available-slot.interface';

const getCanonicalStartKey = (startTimeUTC: string): string => {
  const startDate = DateTime.fromISO(startTimeUTC, { zone: 'utc' });

  if (!startDate.isValid) {
    return startTimeUTC;
  }

  return startDate.startOf('minute').toUTC().toISO() ?? startTimeUTC;
};

export const normalizeAvailabilitySlots = (
  slots: AvailableSlot[],
): AvailableSlot[] => {
  const slotsByStart = new Map<string, AvailableSlot>();

  slots.forEach((slot) => {
    const canonicalStartKey = getCanonicalStartKey(slot.startTimeUTC);
    const existingSlot = slotsByStart.get(canonicalStartKey);

    if (!existingSlot) {
      slotsByStart.set(canonicalStartKey, {
        ...slot,
        availableStaff: [...slot.availableStaff],
        startTimeUTC: canonicalStartKey,
      });
      return;
    }

    const staffById = new Map(
      existingSlot.availableStaff.map((staff) => [staff.id, staff]),
    );

    slot.availableStaff.forEach((staff) => {
      staffById.set(staff.id, staff);
    });

    existingSlot.availableStaff = Array.from(staffById.values());
    existingSlot.endTimeUTC =
      slot.endTimeUTC > existingSlot.endTimeUTC
        ? slot.endTimeUTC
        : existingSlot.endTimeUTC;
  });

  return Array.from(slotsByStart.values()).sort((a, b) =>
    a.startTimeUTC.localeCompare(b.startTimeUTC),
  );
};
