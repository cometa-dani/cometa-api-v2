import jwt from "jsonwebtoken";


export const testUsers = [
  {
    username: "@jhondoe",
    email: "jhondoe@gmail.com",
    uid: "OtTTIQmyHYb9cEHufTt542YWaZS2",
    name: "Jhon Doe"
  },
  {
    username: "@janeDoe",
    email: "janeDoe@gmail.com",
    uid: "OtTTIQmyHYb9cEHufTt542YWaZS3",
    name: "Jane Doe"
  },
  {
    username: "@bobSmith",
    email: "bobSmith@gmail.com",
    uid: "OtTTIQmyHYb9cEHufTt542YWaZS4",
    name: "Bob Smith"
  },
  {
    username: "@aliceJohnson",
    email: "aliceJohnson@gmail.com",
    uid: "OtTTIQmyHYb9cEHufTt542YWaZS5",
    name: "Alice Johnson"
  },
  {
    username: "@mikeWilliams",
    email: "mikeWilliams@gmail.com",
    uid: "OtTTIQmyHYb9cEHufTt542YWaZS6",
    name: "Mike Williams"
  },
  {
    username: "@emilyDavis",
    email: "emilyDavis@gmail.com",
    uid: "OtTTIQmyHYb9cEHufTt542YWaZS7",
    name: "Emily Davis"
  },
  {
    username: "@davidMiller",
    email: "davidMiller@gmail.com",
    uid: "OtTTIQmyHYb9cEHufTt542YWaZS8",
    name: "David Miller"
  },
  {
    username: "@sarahTaylor",
    email: "sarahTaylor@gmail.com",
    uid: "OtTTIQmyHYb9cEHufTt542YWaZS9",
    name: "Sarah Taylor"
  },
  {
    username: "@kevinWhite",
    email: "kevinWhite@gmail.com",
    uid: "OtTTIQmyHYb9cEHufTt542YWaZS10",
    name: "Kevin White"
  },
  {
    username: "@lauraBrown",
    email: "lauraBrown@gmail.com",
    uid: "OtTTIQmyHYb9cEHufTt542YWaZS11",
    name: "Laura Brown"
  }
];

// Secret key used to sign the JWT. Make sure it matches the secret key expected by your middleware
const SECRET_KEY = 'your_secret_key';

// Function to generate tokens for each user
export const usersJwts = testUsers.map(user => {
  const payload = {
    user_id: user.uid,
    name: user.name,
    email: user.email,
  };
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '2h' });
});
