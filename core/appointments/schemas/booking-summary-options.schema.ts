import { z } from 'zod';

export const bookingSummaryOptionsSchema = z.object({
  addToCalendar: z.boolean(),
});

export type BookingSummaryOptionsValues = z.infer<
  typeof bookingSummaryOptionsSchema
>;
