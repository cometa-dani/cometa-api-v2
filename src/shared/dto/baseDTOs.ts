import { z } from "zod";


export const idsSchemma = (
  z.object({
    id: z.number({ coerce: true }),
    uid: z.string(),
    photoId: z.number({ coerce: true }),
    eventId: z.number({ coerce: true }),
    userId: z.number({ coerce: true }),
    likeId: z.number({ coerce: true }),
    friendshipId: z.number({ coerce: true }),
    organizationId: z.number({ coerce: true }),
    locationId: z.number({ coerce: true }),
  })
    .partial()
);

export type IdsDto = z.infer<typeof idsSchemma>;


export const paginationSchemma = z.object({
  limit: z.number({ coerce: true }).default(10).optional(),
  cursor: z.number({ coerce: true }).default(0).optional(),
  page: z.number({ coerce: true }).optional(),
});

export type PaginationDto = z.infer<typeof paginationSchemma>;
