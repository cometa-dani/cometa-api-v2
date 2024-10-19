import * as z from 'zod';


export const worlCities = z.object({
  cityName: z.string().max(255).default('').transform((val) => val.trim().toLowerCase()),
  cursor: z.number({ coerce: true }).int().default(-1),
  limit: z.number({ coerce: true }).int().optional().default(10),
});
