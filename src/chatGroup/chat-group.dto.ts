import z from 'zod';


export const createChatGroup = z.object({
  groupName: z.string(),
  members: z.array(z.string())
});

export type CreateChatGroupDTO = z.infer<typeof createChatGroup>;


export const iDParam = z.object({
  id: z.string()
});
