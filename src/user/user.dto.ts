import z from 'zod';
import { EventCategory, UserPhoto } from '@prisma/client';
import { paginationSchema } from '../shared/dto/baseDTOs';


export const searchQueryParamsSchemma = z.object({
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

export type SearchByQueryParamsDTO = z.infer<typeof searchQueryParamsSchemma>


export const searchByUsernameSchemma =
  z.object({
    username:
      z.string()
        .optional()
        .transform(
          (str) => str ?
            str?.startsWith('@') ? str : '@' + str
            :
            str?.length === 0 ? '@' : str
        )
  })
    .merge(paginationSchema);

export type SearchByUsernameDTO = z.infer<typeof searchByUsernameSchemma>


export const createUserSchemma = z.object({
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

export type CreateUserDTO = z.infer<typeof createUserSchemma>


export const updateUserSchemma = (
  createUserSchemma
    .extend({
      phone: z.string(),
      birthday: z.string().transform(date => date ? new Date(date) : date),
      activateNotifications: z.boolean(),
      lookingFor: z.enum([
        'MEET_NEW_PEOPLE',
        'DISCOVER_NEW_EVENTS',
        'FIND_NEW_PLACES',
        'FRIENDSHIP',
        'RELATIONSHIP',
        'NETWORKING',
      ]),
      occupation: z.string(),
      educationLevel: z.enum([
        'SECONDARY',
        'UNIVERSITY',
        'HIGH_SCHOOL',
        'SOME_COLLEGE',
        'BACHELORS',
        'MASTERS',
        'DOCTORATE',
        'OTHER',
      ]),
      currentLocation: z.string(),
      homeTown: z.string(),
      languages:
        z.string()
          .transform(value => value.split(',')),
      height: z.number(),
      weight: z.number(),
      favoriteSports: z.array(z.string()),
      music: z.array(z.string()),
      relationshipStatus: z.enum([
        'SINGLE',
        'IN_A_RELATIONSHIP',
        'MARRIED',
        'DIVORCED',
        'WIDOWED',
        'OTHER',
      ]),
      pets: z.array(z.string()),
      smoking: z.boolean(),
      drinking: z.boolean(),
      ethnicity: z.enum([
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
      ]),
      children: z.boolean(),
      company: z.string(),
      verified: z.boolean(),
      gender: z.enum([
        'MALE',
        'FEMALE',
        'BINARY',
        'GAY',
        'BISEXUAL',
        'LESBIAN',
        'OTHER',
      ]),
      exerciseFrequency: z.enum([
        'NEVER',
        'RARELY',
        'SOMETIMES',
        'OFTEN',
        'DAILY',
      ]),
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
    })
    .partial()
);

export type UpdateUserDTO = z.infer<typeof updateUserSchemma>
export type UserPhotoDTO = Pick<UserPhoto, 'url' | 'order' | 'placeholder'>
