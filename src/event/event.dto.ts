import { z } from 'zod';
import { EventCategory, EventPhoto } from '@prisma/client';


export const searchEventsSchemma = z.object({
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

export type SearchEventsDTO = z.infer<typeof searchEventsSchemma>

export const getAllEventsSchemma = z.object({
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

export type GetAllEventsDTO = z.infer<typeof getAllEventsSchemma>

export const createEventSchemma = z.object({
  name: z.string().default(''),
  description: z.string().min(5).max(200).default(''),
  locationId: z.number({ coerce: true }),
  organizationId: z.number({ coerce: true }),
  date: z.string().transform(date => new Date(date)),
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

export type CreateEventDto = z.infer<typeof createEventSchemma>

export const updateEventSchemma = z.object({
  name: z.string().optional(),
  description: z.string().min(5).max(200).optional(),
  locationId: z.number({ coerce: true }).optional(),
  organizationId: z.number({ coerce: true }).optional(),
  date: z.string().transform(date => new Date(date)).optional(),
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

export type UpdateEventDto = z.infer<typeof updateEventSchemma>

export const getEventIdSchemma = z.object({
  id: z.number({ coerce: true }).optional(),
  uid: z.string().optional()
});

export type EventParamsDto = z.infer<typeof getEventIdSchemma>

export const searchEventByNameSchemma = z.object({
  name: z.string(),
  limit: z.number({ coerce: true }).optional(),
  cursor: z.number({ coerce: true }).optional(),
});

export type SearchEventByNameDto = z.infer<typeof searchEventByNameSchemma>

export type EventPhotoDTO = Pick<EventPhoto, 'url' | 'order' | 'placeholder'>
