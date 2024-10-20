import z from 'zod';
import { EventCategory, UserPhoto } from '@prisma/client';


export const schemmaSearchQueryParams = z.object({
  username:
    z.string()
      .optional()
      .transform(
        (str) => str ?
          str.startsWith('@') ? str : '@' + str
          :
          str
      ),
  email: z.string().email().optional(),
  phone: z.string().optional()
});

export type SearchByQueryParamsDTO = z.infer<typeof schemmaSearchQueryParams>


export const schemmaSearchByUsername = z.object({
  username:
    z.string()
      .optional()
      .transform(
        (str) => str ?
          str?.startsWith('@') ? str : '@' + str
          :
          str?.length === 0 ? '@' : str
      ),

  limit: z.number({ coerce: true }).default(0).optional(),
  cursor: z.number({ coerce: true }).default(10).optional(),
});

export type SearchByUsernameDTO = z.infer<typeof schemmaSearchByUsername>


export const schemmaCreateUser = z.object({
  username: z.string().min(2).max(18)
    .transform(
      (str) => str ?
        str.startsWith('@') ? str : '@' + str
        :
        str
    ),

  email: z.string().email(),
  name: z.string().min(3).max(26),
  uid: z.string(),
  birthday: z.string().transform(date => new Date(date)),
});

export type CreateUserDTO = z.infer<typeof schemmaCreateUser>


export const schemmaUpdateUser = z.object({
  username: z.string().min(3).max(18).optional()
    .transform(
      (str) => str ?
        str.startsWith('@') ? str : '@' + str
        :
        str
    ),

  name: z.string().min(3).max(26).optional(),
  email: z.string().email().optional(),
  uid: z.string().optional(),
  phone: z.string().optional(),

  biography: z.string().max(120).optional(),
  birthday: z.string().optional().transform(date => date ? new Date(date) : date),
  activateNotifications: z.boolean().optional(),

  lookingFor: z.enum([
    'MEET_NEW_PEOPLE',
    'DISCOVER_NEW_EVENTS',
    'FIND_NEW_PLACES',
    'FRIENDSHIP',
    'RELATIONSHIP',
    'NETWORKING',
  ])
    .optional(),

  occupation: z.string().optional(),

  educationLevel: z.enum([
    'SECONDARY',
    'UNIVERSITY',
    'HIGH_SCHOOL',
    'SOME_COLLEGE',
    'BACHELORS',
    'MASTERS',
    'DOCTORATE',
    'OTHER',
  ])
    .optional(),

  currentLocation: z.string().optional(),
  homeTown: z.string().optional(),

  languages:
    z.string()
      .transform(value => value.split(','))
      .optional(),

  height: z.number().optional(),
  weight: z.number().optional(),
  favoriteSports: z.array(z.string()).optional(),
  music: z.array(z.string()).optional(),

  relationshipStatus: z.enum([
    'SINGLE',
    'IN_A_RELATIONSHIP',
    'MARRIED',
    'DIVORCED',
    'WIDOWED',
    'OTHER',
  ])
    .optional(),

  pets: z.array(z.string()).optional(),
  smoking: z.boolean().optional(),
  drinking: z.boolean().optional(),

  religion: z.enum([
    'CHRISTIANITY',
    'ISLAM',
    'HINDUISM',
    'BUDDHISM',
    'SIKHISM',
    'JUDAISM',
    'ATHEISM',
    'AGNOSTICISM',
    'OTHER',
  ])
    .optional(),

  ethinicity: z.enum([
    'WHITE',
    'HISPANIC',
    'LATINO',
    'BLACK',
    'ASIAN',
    'MIDDLE_EASTERN',
    'NATIVE_AMERICAN',
    'PACIFIC_ISLANDER',
    'MIXED',
    'OTHER',
  ])
    .optional(),

  children: z.boolean().optional(),
  company: z.string().optional(),
  verified: z.boolean().optional(),
  gender: z.enum([
    'MALE',
    'FEMALE',
    'BINARY',
    'GAY',
    'BISEXUAL',
    'LESBIAN',
    'OTHER',
  ])
    .optional(),

  diet: z.enum([
    'OMNIVORE',
    'VEGETARIAN',
    'VEGAN',
    'PESCATARIAN',
  ])
    .optional(),

  exerciseFrequency: z.enum([
    'NEVER',
    'RARELY',
    'SOMETIMES',
    'OFTEN',
    'DAILY',
  ])
    .optional(),

  interests: z.string()
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

export type UpdateUserDTO = z.infer<typeof schemmaUpdateUser>


export const schemmaUrlParams = z.object({
  id: z.number({ coerce: true }).optional(),
  uid: z.string().optional(),
});

export type UrlParamsDTO = z.infer<typeof schemmaUrlParams>


export const schemmaEventID = z.object({
  eventId: z.number({ coerce: true }).optional()
});

export type EventIdQueryParamsDTO = z.infer<typeof schemmaEventID>


export type UserPhotoDTO = Pick<UserPhoto, 'url' | 'order' | 'placeholder'>
