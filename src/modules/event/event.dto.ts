import { z } from 'zod';
import { Event, EventCategory, EventLike, EventPhoto, User } from '@prisma/client';
import { paginationSchema } from '../shared/dto/baseDTOs';


export const searchEventsSchemma =
  z.object({
    isLiked: z.boolean({ coerce: true }).default(false).optional(),
    likes: z.boolean({ coerce: true }).default(false).optional(),
    shares: z.boolean({ coerce: true }).default(false).optional(),
    photos: z.boolean({ coerce: true }).default(false).optional(),
    targetUserId: z.number({ coerce: true }).optional(),
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
  })
    .merge(paginationSchema);

export type SearchEventsDTO = z.infer<typeof searchEventsSchemma>

export const getTargetUserEventsSchemma =
  z.object({
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
  })
    .merge(paginationSchema);

export type GetTargetUserEventsDTO = z.infer<typeof getTargetUserEventsSchemma>

export type EventPhotoDTO = Pick<EventPhoto, 'url' | 'order' | 'placeholder'>

export interface ILikeableEvent extends Event {
  isLiked: boolean;
}

export interface ILikedEvent {
  id: number;
  event: Event;
  isLiked: boolean;
}

export interface IUsersLikedSameEvent extends EventLike {
  user: User & {
    hasIncommingFriendship: boolean;
    hasOutgoingFriendship: boolean;
  };
}
