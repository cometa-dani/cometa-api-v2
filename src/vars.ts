import dotenv from 'dotenv';

dotenv.config();
const { env } = process;
export const nodeEnv = env.NODE_ENV;
export const host = env.HOST ?? '192.168.0.101';
export const port = env.PORT ? Number(env.PORT) : 3000;

export const maxNumPhotosPerEvent = 3;
export const maxNumPhotosPerUser = 7;

// supabase
export const supabaseUrl = env.SUPABASE_URL;
export const supabaseAnonimousKey = env.SUPABASE_ANON_KEY;
