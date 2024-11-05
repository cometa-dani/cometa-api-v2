import axios from 'axios';
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient()
const endpoint = 'users'


beforeEach(async () => {
  await prisma.user.deleteMany();
});


describe(`POST api/v1/${endpoint}`, () => {
  it('should create a new user', async () => {
    const userData = {
      username: "jhondoe",
      email: "jhondoe@gmail.com",
      uid: "OtTTIQmyHYb9cEHufTt542YWaZS2",
      name: "Jhon Doe",
      birthday: "Mon Oct 20 1999"
    }
    const response = await axios.post(`/${endpoint}`, userData);

    expect(response.status).toBe(201);
    expect(response.data).toMatchObject({
      username: userData.username,
      name: userData.name,
      email: userData.email,
      uid: userData.uid,
      birthday: userData.birthday,
    });
    // Verify database state
    const user = await prisma.user.findUnique({
      where: { email: userData.email }
    });
    expect(user).toBeTruthy();
  });

  it('should handle invalid input', async () => {
    const invalidData = {
      name: 'Test User'
      // Missing email
    };
    const response = await axios.post(`/${endpoint}`, invalidData)
    expect(response.status).toBe(400);
  });
});


describe(`PUT api/v1/${endpoint}`, () => {
  let testUser: User;

  it('should update an existing user', async () => {
    const userData = {
      username: "jhondoe",
      email: "jhondoe@gmail.com",
      uid: "OtTTIQmyHYb9cEHufTt542YWaZS2",
      name: "Jhon Doe",
      birthday: "Mon Oct 20 1999"
    }
    // First, create the user so that there is a user to update
    testUser = await axios.post(`/${endpoint}`, userData);

    const updatedData = {
      username: "cesar_updated",
      name: "Cesar R. Miranda",
      birthday: "Tue Oct 16 1990" // Example of a date update
    };
    // Send the update request
    const updateResponse = await axios.put(`/${endpoint}/${userData.uid}`, updatedData);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data).toMatchObject({
      username: updatedData.username,
      name: updatedData.name,
      email: userData.email, // Email remains the same
      uid: userData.uid,
      birthday: updatedData.birthday,
    });
    // Verify database state
    const user = await prisma.user.findUnique({
      where: { email: userData.email }
    });
    expect(user).toBeTruthy();
    expect(user).toMatchObject({
      username: updatedData.username,
      name: updatedData.name,
      birthday: updatedData.birthday,
    });
  });

  it('should handle invalid update input', async () => {
    const invalidData = { birthday: "InvalidDate" };
    try {
      await axios.put(`/${endpoint}/${testUser.id}`, invalidData);
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data).toHaveProperty('message', 'Invalid birthday format'); // Adjust message based on actual error handling
    }
  });
});


describe(`GET /api/${endpoint}/:uid`, () => {
  it('should return user by id', async () => {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        username: "cesar316",
        email: "riveramirandac@gmail.com",
        uid: "q9zDafHyieeKC5rbLMZIkhkJxJG3",
        name: "Cesar Rivera Miranda",
        birthday: "Mon Oct 16 1989"
      }
    });
    const response = await axios.get(`/${endpoint}/${testUser.uid}`)

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      username: testUser.username,
      name: testUser.name,
      email: testUser.email,
      uid: testUser.uid,
      birthday: testUser.birthday,
    });
  });

  it('should return 404 for non-existent user', async () => {
    const response = await axios.get(`/${endpoint}/non-existent-id`)
    expect(response.status).toBe(404);
  });
});
