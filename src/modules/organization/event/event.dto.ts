import { EventCategory } from "@prisma/client";
import { z } from "zod";


export const createEventSchemma = z.object({
  name: z.string().default(''),
  description: z.string().min(3).max(1000),
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

export const updateEventSchemma = (
  createEventSchemma.omit({ organizationId: true }).partial()
);

export type UpdateEventDto = z.infer<typeof updateEventSchemma>
