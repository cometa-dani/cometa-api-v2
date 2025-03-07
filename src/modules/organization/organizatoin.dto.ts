import * as z from 'zod';


export const createOrganizationSchemma = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email(),
  description: z.string().min(3).max(255),
  phone: z.string().min(6).max(255),
  uid: z.string(),
});

export type CreateOrganizationDTO = z.infer<typeof createOrganizationSchemma>;

export const updateOrganizationSchemma = (
  createOrganizationSchemma
    .extend({
      webPage: z.string().url(),
      instagramPage: z.string().url(),
      facebookPage: z.string().url(),
      avatarUrl: z.string().url(),
    })
    .partial()
);

export type UpdateOrganizationDTO = z.infer<typeof updateOrganizationSchemma>;
