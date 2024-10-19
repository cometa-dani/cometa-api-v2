import z from 'zod';
import { Friendship, User } from '@prisma/client';


export const paramsSchemma = z.object({
  id: z.number({ coerce: true }).optional(),
  uuid: z.string().optional()  // remove in te future
});

export type ParamsDTo = z.infer<typeof paramsSchemma>;

export const queryParams = z.object({
  receiverid: z.number({ coerce: true })
});

export const paginatedQueries = z.object({
  limit: z.number({ coerce: true }),
  cursor: z.number({ coerce: true }).optional(),
  page: z.number({ coerce: true }).optional(),
  friendUserName: z.string().transform(str => str.startsWith('@') ? str : `@${str}`).optional()
});

export type PaginatedQueriesDto = z.infer<typeof paginatedQueries>;

export const updateBodySchemma = z.object({
  status: z.enum(['ACCEPTED', 'PENDING', 'BLOCKED'])
});

export type UpdateBodyDto = z.infer<typeof updateBodySchemma>

export interface NewFriend extends Friendship {
  sender: User,
  receiver: User
}
