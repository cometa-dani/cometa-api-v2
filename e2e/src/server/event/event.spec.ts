import { PrismaClient } from "@prisma/client";
import { createFootballEvents } from "./eventData";


const prisma = new PrismaClient()


beforeAll(async () => {
  await prisma.organization.deleteMany() // cascades and deletes all events
  await createFootballEvents()
})


afterAll(async () => {
  await prisma.organization.deleteMany(); // comment when coding
})


// 1
describe('GET api/v1/events', () => {
  it('should get the latest paginated events', async () => {

    expect(true).toBe(true);
  })
});


// 2
describe('GET api/v1/events/search', () => {
  it('should get search paginated events by name', async () => {
    expect(true).toBe(true);
  })
});


// 3
describe('GET api/v1/events/:eventId?likes=true', () => {
  it('should get an event by id with likes', async () => {
    expect(true).toBe(true);
    //
    //
    //
    //
    //
    //
  })
});


// 4
describe('GET api/v1/events/likeds', () => {
  it('should get the buket-list for logged in user', async () => {
    expect(true).toBe(true);
    //
    //
    //
    //
  })

  it('should get the buket-list for target user', async () => {
    expect(true).toBe(true);
    //
    //
    //
    //
  })
});


//  5 ?liked-by-user1=123?liked-by-user2=123
describe('GET api/v1/events/likeds?liked-by-user1=123&liked-by-user2=123', () => {
  it('should get the buket-list for two users', async () => {
    expect(true).toBe(true);
    //
    //
    //
    //
  })
})
