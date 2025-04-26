import { z } from "zod";


export const createLocationSchemma = z.object({
  name: z.string(),
  description: z.string().optional(),
  mapUrl: z.string().optional(),
  latitude: z.number({ coerce: true }).optional(),
  longitude: z.number({ coerce: true }).optional(),
  organizationId: z.number({ coerce: true }),
});

export type CreateLocationDto = z.infer<typeof createLocationSchemma>;

export const updateLocationSchemma = createLocationSchemma.partial();

export type UpdateLocationDto = z.infer<typeof updateLocationSchemma>;
