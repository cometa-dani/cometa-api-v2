import { z } from "zod";


export const idsSchema = (
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

export type IdsDto = z.infer<typeof idsSchema>;


export const paginationSchema = z.object({
  limit: z.number({ coerce: true }).default(10).optional(),
  cursor: z.number({ coerce: true }).default(0).optional(),
  page: z.number({ coerce: true }).optional(),
});

export type PaginationDto = z.infer<typeof paginationSchema>;

export type PaginatedResult<T> = {
  items: T[],
  nextCursor: number
  hasNextCursor: boolean
  itemsPerPage: number
  totalItems: number
}
