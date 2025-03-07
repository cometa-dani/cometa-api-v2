import axios from 'axios';
import { PrismaClient, User } from "@prisma/client";
import { testUser1, testUser2, tokenUser1 } from "./userData";


const prisma = new PrismaClient()
const endpoint = 'users'


beforeEach(async () => {
  await prisma.user.deleteMany();
});


afterAll(async () => {
  await prisma.user.deleteMany();
})


describe(`POST api/v1/users`, () => {
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
      where: { email: testUser1.email }
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


// 1
// CHANGE FOR: for describe('GET /api/v1/users/:id?likedEvents=true')
describe(`GET /api/v1/users/:uid`, () => {
  it('should return user by uid with liked events', async () => {
    await axios.post(`/${endpoint}`, testUser1);
    const response = await axios.get(`/${endpoint}/${testUser1.uid}`)
    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      username: '@' + testUser1.username,
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


// 1
// CHANGE FOR: after refactoring the routes **************************
describe(`GET /api/v1/users/:id?likedEvents=true`, () => {
  it('should get an user by id with liked events', async () => {
    expect(true).toBe(true);
    //
    //
    //
    //
    //
  })
})


// 2
// TODO: after refactoring the routes **************************
describe(`GET /api/v1/users/targets/:targetUserId=1231231`, () => {
  it('should get an user by id with friends', async () => {
    expect(true).toBe(true);
  })

  // 2
  it('should query for ?friends=true&likes=true', async () => {
    expect(true).toBe(true);
    //
    //
    //
    //
    //
  })
})


describe(`PATCH api/v1/users/:id`, () => {
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
      where: { username: testUser.username }
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
    const invalidData = { birthday: "InvalidDate" };
    try {
      await axios.patch(`/${endpoint}/${testUser.id}`, invalidData);
    } catch (error) {
      expect(error.response.status).toBe(404); // not found
    }
  });
});


// 3
// TODO: after refactoring the routes **************************
describe(`GET /api/v1/users/search?username=@jho&liked-same-event=121321&cursor=0&limit=10`, () => {
  it('should search ?username=@jho for PAGINATED users by username starting with @', async () => {
    await Promise.all([
      axios.post(`/${endpoint}`, testUser1),
      axios.post(`/${endpoint}`, testUser2)
    ]);
    const response = (
      await axios.get(
        `/${endpoint}/search?username=@jho&limit=10&cursor=0`, // Search for users with username starting with @jho
        { headers: { Authorization: `Bearer ${tokenUser1}` } }
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

  // 3
  // TODO: after refactoring the routes **************************
  it('should search ?liked-same-event=121321 for PAGINATED users', async () => {
    expect(true).toBe(true);
    //
    //
    //
    //
    //
    //
  })
})


// 4
// TODO: after refactoring the routes **************************
describe(`GET api/v1/users?username=@jho&email=jho%40gmail.com`, () => {
  it('should GET ONE SINGLE USER by username', async () => {
    expect(true).toBe(true);
    //
    //
    //
    //
    //
  })

  it('should GET ONE SINGLE USER by email', async () => {
    expect(true).toBe(true);
    //
    //
    //
    //
    //
  })
})
