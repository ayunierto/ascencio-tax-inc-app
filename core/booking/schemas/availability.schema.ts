import * as z from 'zod';
import { searchAvailabilitySchema } from '@ascencio/shared';

export const availabilitySchema = searchAvailabilitySchema.extend({
  time: z.string({ message: 'timeRequired' }).min(4, 'timeRequired'),
});

export type AvailabilityFormValues = z.infer<typeof availabilitySchema>;
