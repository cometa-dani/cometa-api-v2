import z from 'zod';
import { Friendship, User } from '@prisma/client';
import { paginationSchemma } from '../shared/dto/baseDTOs';


export const getFriendshipByFieldSchemma = z.object({
  receiverid: z.number({ coerce: true })
});

export const getAllFriendshipsSchemma =
  z.object({
    friendUserName: z.string().transform(str => str.startsWith('@') ? str : `@${str}`).optional()
  })
    .merge(paginationSchemma);

export type GetFriendshipsDto = z.infer<typeof getAllFriendshipsSchemma>;

export const updateFrienshipSchemma = z.object({
  status: z.enum(['ACCEPTED', 'PENDING', 'BLOCKED'])
});

export type UpdateFriendshipDto = z.infer<typeof updateFrienshipSchemma>

export interface NewFriend extends Friendship {
  sender: User,
  receiver: User
}
