import jwt from "jsonwebtoken";


export const testUser1 = {
  username: "jhondoe",
  email: "jhondoe@gmail.com",
  uid: "OtTTIQmyHYb9cEHufTt542YWaZS2",
  name: "Jhon Doe",
  birthday: "Mon Oct 16 1989"
}

// Secret key used to sign the JWT. Make sure it matches the secret key expected by your middleware
const SECRET_KEY = 'your_secret_key';
// Define the payload to include `user_id`, mimicking a Firebase token
const payloadUser1 = {
  user_id: testUser1.uid,
  name: testUser1.name,
  email: testUser1.email,
};

// Generate the token
export const tokenUser1 = jwt.sign(payloadUser1, SECRET_KEY, {expiresIn: '1h'}); // Expires in 1 hour


export const testUser2 = {
  username: "@jhonny",
  email: "riveramirandac@gmail.com",
  uid: "q9zDafHyieeKC5rbLMZIkhkJxJG3",
  name: "Cesar Rivera Miranda",
  birthday: "Mon Oct 16 1989"
}
