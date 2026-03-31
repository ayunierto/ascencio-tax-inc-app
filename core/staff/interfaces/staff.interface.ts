import { Schedule } from '@/core/schedules/interfaces/schedule.interface';

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  schedules: Schedule[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
