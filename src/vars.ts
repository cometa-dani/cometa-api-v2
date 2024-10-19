import dotenv from 'dotenv';
import zod from 'zod';


const parseKey =
  zod
    .string()
    .transform(
      str => (new RegExp(/\\n/gm)).test(str) ?
        str.replace(new RegExp(/\\n/gm), '\n')
        :
        str
    );

dotenv.config();
const { env } = process;
export const nodeEnv = env.NODE_ENV;
export const host = env.HOST ?? '192.168.0.101';
export const port = env.PORT ? Number(env.PORT) : 3000;

// firebase
export const bucketName = env.FIREBASE_BUCKET_NAME;
export const clientEmail = env.FIREBASE_CLIENT_EMAIL;
export const privateKey = env.FIREBASE_PRIVATE_KEY;
export const projectId = env.FIREBASE_PROJECT_ID;

const parsedKey_FIREBASE_PRIVATE_KEY = parseKey.safeParse(env.FIREBASE_PRIVATE_KEY);

if (!parsedKey_FIREBASE_PRIVATE_KEY.success) {
  throw new Error('parsing errror');
}
export const serviceAccount = {
  project_id: env?.FIREBASE_PROJECT_ID,
  private_key: parsedKey_FIREBASE_PRIVATE_KEY.data,
  client_email: env?.FIREBASE_CLIENT_EMAIL,
};

export const maxNumPhotosPerEvent = 3;
export const maxNumPhotosPerUser = 5;
