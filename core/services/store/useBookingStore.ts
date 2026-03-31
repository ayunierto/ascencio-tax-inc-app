import type { Service, StaffMember } from '@ascencio/shared/interfaces';
import { create } from 'zustand';

export interface BookingState {
  // Data
  service?: Service;
  staffMember?: StaffMember;
  start?: string;
  end?: string;
  timeZone?: string;
  comments?: string;

  // Actions
  updateState: (fields: Partial<BookingState>) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>()((set) => ({
  service: undefined,
  staffMember: undefined,
  start: undefined,
  end: undefined,
  timeZone: undefined,
  comments: undefined,

  updateState: (fields: Partial<BookingState>) => {
    set((state) => ({
      ...state,
      ...fields,
    }));
  },

  resetBooking: () => {
    set({
      service: undefined,
      staffMember: undefined,
      start: undefined,
      end: undefined,
      timeZone: undefined,
      comments: undefined,
    });
  },
}));
