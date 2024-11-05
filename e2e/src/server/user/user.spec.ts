import axios from 'axios';
import {PrismaClient, User} from "@prisma/client";

const prisma = new PrismaClient()
const endpoint = 'users'


beforeEach(async () => {
  await prisma.user.deleteMany();
});


afterAll(async () => {
  await prisma.user.deleteMany();
})


describe(`POST api/v1/${endpoint}`, () => {
  it('should create a new user', async () => {
    const userData = {
      username: "jhondoe",
      email: "jhondoe@gmail.com",
      uid: "OtTTIQmyHYb9cEHufTt542YWaZS2",
      name: "Jhon Doe",
      birthday: "Mon Oct 16 1989"
    }
    const response = await axios.post(`/${endpoint}`, userData);
    
    expect(response.status).toBe(201);
    expect(response.data).toMatchObject({
      username: '@' + userData.username,
      name: userData.name,
      email: userData.email,
      uid: userData.uid,
    });
    // Verify database state
    const user = await prisma.user.findUnique({
      where: {email: userData.email}
    });
    expect(user).toBeTruthy();
  });
  
  it('should handle invalid input', async () => {
    const invalidData = {
      name: 'Test User'
      // Missing email
    };
    try {
      await axios.post(`/${endpoint}`, invalidData)
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });
});


describe(`PATCH api/v1/${endpoint}/:id`, () => {
  let testUser: User;
  it('should update an existing user', async () => {
    const userData = {
      username: "jhondoe",
      email: "jhondoe@gmail.com",
      uid: "OtTTIQmyHYb9cEHufTt542YWaZS2",
      name: "Jhon Doe",
      birthday: "Mon Oct 16 1989"
    }
    // First, create the user so that there is a user to update
    const res = await axios.post(`/${endpoint}`, userData);
    testUser = res.data
    const updatedData = {
      currentLocation: 'Doha',
      homeTown: 'Galera',
      languages: ['english', 'spanish'].join(','),
      occupation: 'Software developer',
      educationLevel: 'HIGH_SCHOOL',
      interests: ['EXHIBITION', 'BAR', 'CAFE'].join(','),
      name: "Cesar R. Miranda",
      children: false
    };
    // Send the update request
    const updateResponse = await axios.patch(`/${endpoint}/${testUser.id}`, updatedData);
    
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data).toMatchObject({
      name: updatedData.name,
      homeTown: updatedData.homeTown,
      languages: updatedData.languages.split(','),
      occupation: updatedData.occupation,
      educationLevel: updatedData.educationLevel,
      interests: updatedData.interests.split(','),
      children: updatedData.children
    });
    // Verify database state
    const foundUser = await prisma.user.findUnique({
      where: {username: testUser.username}
    });
    expect(foundUser).toBeTruthy();
    expect(foundUser).toMatchObject({
      name: updatedData.name,
      homeTown: updatedData.homeTown,
      languages: updatedData.languages.split(','),
      occupation: updatedData.occupation,
      educationLevel: updatedData.educationLevel,
      interests: updatedData.interests.split(','),
      children: updatedData.children
    });
  });
  
  it('should handle invalid update input', async () => {
    const invalidData = {birthday: "InvalidDate"};
    try {
      await axios.patch(`/${endpoint}/${testUser.id}`, invalidData);
    } catch (error) {
      expect(error.response.status).toBe(404); // not found
    }
  });
});


describe(`GET /api/${endpoint}/:uid`, () => {
  it('should return user by id', async () => {
    // Create test user
    const testUser = {
      username: "@jhondoe",
      email: "jhondoe@gmail.com",
      uid: "OtTTIQmyHYb9cEHufTt542YWaZS2",
      name: "Jhon Doe",
      birthday: "Mon Oct 16 1989"
    }
    await axios.post(`/${endpoint}`, testUser);
    const response = await axios.get(`/${endpoint}/${testUser.uid}`)
    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      username: testUser.username,
      name: testUser.name,
      email: testUser.email,
      uid: testUser.uid,
    });
  });
  
  it('should return 404 for non-existent user', async () => {
    try {
      await axios.get(`/${endpoint}/non-existent-id`)
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });
});
