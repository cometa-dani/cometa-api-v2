import * as admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { bucketName, serviceAccount } from '../vars';


const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(new Object(serviceAccount)),
  storageBucket: bucketName,
});

export const bucket = getStorage(firebaseApp).bucket(`gs://${bucketName}`);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
