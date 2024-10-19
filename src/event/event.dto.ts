import { z } from 'zod';
import { EventCategory } from '@prisma/client';


export const searchEventsByQueryParams = z.object({
  cursor: z.number({ coerce: true }).default(0).optional(), // default value -1 or 0
  limit: z.number({ coerce: true }).default(10).optional(),
  name: z.string().optional(),
  categories:
    z.string()
      .transform(value => value.split(','))
      .transform(arr => arr
        .map((str) => (
          z.enum([
            'RESTAURANT',
            'BAR',
            'CLUB',
            'CAFE',
            'CONCERT',
            'FESTIVAL',
            'THEATRE',
            'MUSEUM',
            'EXHIBITION',
            'PARK',
            'BRUNCH',
            'SHOWS',
            'SPORTS',
            'GALLERY',
            'PARTY',
            'CINEMA',
            'CONFERENCE',
            'FOOD_AND_DRINK',
            'SEMINAR',
            'WORKSHOP',
            'EDUCATIONAL',
            'CULTURAL',
          ])
        ).parse(str)) as EventCategory[]
      )
      .optional()
});


export type SearchEventsByQueryParamsDTO = z.infer<typeof searchEventsByQueryParams>


export const schemmaEventQueriesWithPagination = z.object({
  cursor: z.number({ coerce: true }).default(0).optional(), // default value -1 or 0
  limit: z.number({ coerce: true }).default(10).optional(),

  allPhotos: z.boolean({ coerce: true }).default(false).optional(),
  userId: z.number({ coerce: true }).optional(),
  categories:
    z.string()
      .transform(value => value.split(','))
      .transform(arr => arr
        .map((str) => (
          z.enum([
            'RESTAURANT',
            'BAR',
            'CLUB',
            'CAFE',
            'CONCERT',
            'FESTIVAL',
            'THEATRE',
            'MUSEUM',
            'EXHIBITION',
            'PARK',
            'BRUNCH',
            'SHOWS',
            'SPORTS',
            'GALLERY',
            'PARTY',
            'CINEMA',
            'CONFERENCE',
            'FOOD_AND_DRINK',
            'SEMINAR',
            'WORKSHOP',
            'EDUCATIONAL',
            'CULTURAL',
          ])
        ).parse(str)) as EventCategory[]
      )
      .optional(),
});

export type EventsByQueryParamsDTO = z.infer<typeof schemmaEventQueriesWithPagination>


export const createEvent = z.object({
  name: z.string().default(''),
  description: z.string().min(5).max(200).default(''),
  locationId: z.number({ coerce: true }),
  organizationId: z.number({ coerce: true }),
  date: z.string(),
  categories:
    z.string()
      .transform(value => value.split(','))
      .transform(arr => arr
        .map((str) => (
          z.enum([
            'RESTAURANT',
            'BAR',
            'CLUB',
            'CAFE',
            'CONCERT',
            'FESTIVAL',
            'THEATRE',
            'MUSEUM',
            'EXHIBITION',
            'PARK',
            'BRUNCH',
            'SHOWS',
            'SPORTS',
            'GALLERY',
            'PARTY',
            'CINEMA',
            'CONFERENCE',
            'FOOD_AND_DRINK',
            'SEMINAR',
            'WORKSHOP',
            'EDUCATIONAL',
            'CULTURAL',
          ])
        ).parse(str)) as EventCategory[]
      ),
});


export const schemmaEventIdParams = z.object({
  id: z.number({ coerce: true }).optional(),
  uid: z.string().optional()
});

export type EventUrlParamsDto = z.infer<typeof schemmaEventIdParams>

export const schemmaSearchByName = z.object({
  name: z.string(),
  limit: z.number({ coerce: true }).optional(),
  cursor: z.number({ coerce: true }).optional(),
});

export type SearchByNameDto = z.infer<typeof schemmaSearchByName>
