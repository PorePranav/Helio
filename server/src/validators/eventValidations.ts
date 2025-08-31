import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string().min(2).max(100),
  location: z.string().min(2).max(100),
  date: z.coerce.date(),
  description: z.string().max(500).optional(),
});

export const updateEventSchema = createEventSchema.partial();
