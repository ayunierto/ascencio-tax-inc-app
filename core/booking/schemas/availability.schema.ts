import * as z from 'zod';

export const availabilitySchema = z.object({
  serviceId: z.string().uuid({ message: 'invalidServiceIdFormat' }),
  staffId: z.string().optional(),
  date: z.string({
    message: 'dateRequired',
  }),
  time: z.string({ message: 'timeRequired' }).min(4, 'timeRequired'),
  timeZone: z.string({
    message: 'timeZoneRequired',
  }),
});

export type AvailabilityRequest = z.infer<typeof availabilitySchema>;
