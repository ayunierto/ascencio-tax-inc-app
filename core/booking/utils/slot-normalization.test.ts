import { normalizeAvailabilitySlots } from './slot-normalization';

import type { AvailableSlot } from '../interfaces/available-slot.interface';

const createSlot = (
  startTimeUTC: string,
  endTimeUTC: string,
  staffIds: string[],
): AvailableSlot => ({
  startTimeUTC,
  endTimeUTC,
  availableStaff: staffIds.map((id, index) => ({
    id,
    firstName: `Staff${index + 1}`,
    lastName: 'Test',
  })) as AvailableSlot['availableStaff'],
});

describe('normalizeAvailabilitySlots', () => {
  it('consolida filas con el mismo horario y elimina staff duplicado', () => {
    const slots = [
      createSlot('2026-04-10T13:30:00.000Z', '2026-04-10T14:30:00.000Z', [
        'staff-a',
      ]),
      createSlot('2026-04-10T13:30:00.000Z', '2026-04-10T14:30:00.000Z', [
        'staff-b',
        'staff-a',
      ]),
    ];

    const normalized = normalizeAvailabilitySlots(slots);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].startTimeUTC).toBe('2026-04-10T13:30:00.000Z');
    expect(normalized[0].availableStaff.map((s) => s.id).sort()).toEqual([
      'staff-a',
      'staff-b',
    ]);
  });

  it('consolida horarios equivalentes dentro del mismo minuto', () => {
    const slots = [
      createSlot('2026-04-10T13:30:00.000Z', '2026-04-10T14:30:00.000Z', [
        'staff-a',
      ]),
      createSlot('2026-04-10T13:30:45.120Z', '2026-04-10T14:30:00.000Z', [
        'staff-b',
      ]),
    ];

    const normalized = normalizeAvailabilitySlots(slots);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].startTimeUTC).toBe('2026-04-10T13:30:00.000Z');
    expect(normalized[0].availableStaff).toHaveLength(2);
  });

  it('ordena los slots por startTimeUTC ascendente', () => {
    const slots = [
      createSlot('2026-04-10T15:30:00.000Z', '2026-04-10T16:30:00.000Z', [
        'staff-b',
      ]),
      createSlot('2026-04-10T13:30:00.000Z', '2026-04-10T14:30:00.000Z', [
        'staff-a',
      ]),
    ];

    const normalized = normalizeAvailabilitySlots(slots);

    expect(normalized.map((s) => s.startTimeUTC)).toEqual([
      '2026-04-10T13:30:00.000Z',
      '2026-04-10T15:30:00.000Z',
    ]);
  });
});
