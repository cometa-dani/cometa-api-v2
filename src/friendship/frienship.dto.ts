import z from 'zod';
import { Friendship, User } from '@prisma/client';


export const getFriendshipByIdSchemma = z.object({
  id: z.number({ coerce: true }).optional(),
  uuid: z.string().optional()  // remove in te future
});

export type FrienshipParamsDTo = z.infer<typeof getFriendshipByIdSchemma>;

export const getFriendshipByFieldSchemma = z.object({
  receiverid: z.number({ coerce: true })
});

export const getAllFriendshipsSchemma = z.object({
  limit: z.number({ coerce: true }),
  cursor: z.number({ coerce: true }).optional(),
  page: z.number({ coerce: true }).optional(),
  friendUserName: z.string().transform(str => str.startsWith('@') ? str : `@${str}`).optional()
});

export type GetFriendshipsDto = z.infer<typeof getAllFriendshipsSchemma>;

export const updateFrienshipSchemma = z.object({
  status: z.enum(['ACCEPTED', 'PENDING', 'BLOCKED'])
});

export type UpdateFriendshipDto = z.infer<typeof updateFrienshipSchemma>

export interface NewFriend extends Friendship {
  sender: User,
  receiver: User
}
