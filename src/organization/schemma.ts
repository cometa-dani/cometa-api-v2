import * as z from 'zod';


export const createOrganizationSchemma = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email(),
  description: z.string().min(3).max(255),
  password: z.string().min(6).max(255),
  phone: z.string().min(6).max(255),
  uid: z.string(),
});

export type CreateOrganizationDTO = z.infer<typeof createOrganizationSchemma>;


export const updateOrganizationSchemma = z.object({
  name: z.string().min(3).max(255).optional(),
  email: z.string().email().optional(),
  description: z.string().min(3).max(255).optional(),
  password: z.string().min(6).max(255).optional(),
  phone: z.string().min(6).max(255).optional(),
  uid: z.string().optional(),
  webPage: z.string().url().optional(),
  instagramPage: z.string().url().optional(),
  facebookPage: z.string().url().optional(),
  avatarUrl: z.string().url().optional(),
});


export type UpdateOrganizationDTO = z.infer<typeof updateOrganizationSchemma>;
