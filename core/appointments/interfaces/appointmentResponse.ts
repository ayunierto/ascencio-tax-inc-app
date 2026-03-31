import { User } from '@/core/auth/interfaces';
import type { StaffMember, Service } from '@ascencio/shared/interfaces';

export interface Appointment {
  id: string;
  start: string;
  end: string;
  status: string;
  comments: string;
  calendarEventId: string;
  zoomMeetingId: string;
  zoomMeetingLink: string;
  source?: string;
  cancellationReason?: string;
  service: Service;
  user: User;
  staffMember: StaffMember;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}
