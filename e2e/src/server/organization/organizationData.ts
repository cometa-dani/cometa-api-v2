import jwt from "jsonwebtoken";
import { Organization } from "@prisma/client";


export const testOrganization1: Partial<Organization> = {
  name: 'Asian Cup',
  description: 'The best football in the entire world.',
  email: 'email@email.com',
  uid: 'asian-cup',
  phone: '0969711306',
}

// Secret key used to sign the JWT. Make sure it matches the secret key expected by your middleware
const SECRET_KEY = 'your_secret_key';
// Define the payload to include `user_id`, mimicking a Firebase token
const payloadUser1 = {
  user_id: testOrganization1.uid,
  name: testOrganization1.name,
  email: testOrganization1.email,
};

// Generate the token
export const tokenOrganization1 = jwt.sign(payloadUser1, SECRET_KEY, { expiresIn: '2h' }); // Expires in 1 hour

export const testOrganization2: Partial<Organization> = {
  name: 'Chotto Matte',
  uid: 'chotto-matte',
  email: 'doha@chotto-matte.com',
  phone: '5996 52 349',
  webPage: 'https://chotto-matte.com/',
  instagramPage: 'https://www.instagram.com/chottomatteglobal/',
}


export const testOrganization3: Partial<Organization> = {
  name: 'Megapolis',
  uid: 'megapolis',
  email: 'info@palma-intl.com',
  phone: '44378444',
  webPage: 'https://megapolisqatar.com/index.html',
  instagramPage: 'https://www.instagram.com/megapolisqatar/',
}
