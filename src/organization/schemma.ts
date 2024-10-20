import * as z from 'zod';


export const createOrganizationSchemma = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email(),
  description: z.string().min(3).max(255),
  password: z.string().min(6).max(255),
  phone: z.string().min(6).max(255),
  webPage: z.string().url().optional(),
  instagramPage: z.string().url().optional(),
  facebookPage: z.string().url().optional(),
  accessToken: z.string().min(6).optional(),
});
