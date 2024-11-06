import axios from 'axios';
import {PrismaClient, User} from "@prisma/client";
import {testUser1, testUser2, tokenUser1} from "./userData";


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
    const response = await axios.post(`/${endpoint}`, testUser1);
    
    expect(response.status).toBe(201);
    expect(response.data).toMatchObject({
      username: '@' + testUser1.username,
      name: testUser1.name,
      email: testUser1.email,
      uid: testUser1.uid,
    });
    // Verify database state
    const user = await prisma.user.findUnique({
      where: {email: testUser1.email}
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
    // First, create the user so that there is a user to update
    const res = await axios.post(`/${endpoint}`, testUser1);
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


describe(`GET /api/v1/${endpoint}/:uid`, () => {
  it('should return user by id', async () => {
    await axios.post(`/${endpoint}`, testUser1);
    const response = await axios.get(`/${endpoint}/${testUser1.uid}`)
    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      username: '@'+ testUser1.username,
      name: testUser1.name,
      email: testUser1.email,
      uid: testUser1.uid,
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


describe(`GET /api/v1/${endpoint}/search?username=@jho`, () => {
  it('should search for users by username with pagination', async () => {
    await Promise.all([
      axios.post(`/${endpoint}`, testUser1),
      axios.post(`/${endpoint}`, testUser2)
    ]);
    const response = (
      await axios.get(
        `/${endpoint}/search?username=@jho&limit=10&cursor=0`, // Search for users with username starting with @jho
        {headers: {Authorization: `Bearer ${tokenUser1}`}}
      )
    );
    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      items: expect.any(Array),
      totalItems: expect.any(Number),
      nextCursor: expect.any(Number),
      hasNextCursor: expect.any(Boolean),
      itemsPerPage: expect.any(Number),
    });
  });
})
