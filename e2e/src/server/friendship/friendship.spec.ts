import { Friendship, PrismaClient } from "@prisma/client";
import { testUsers, usersJwts } from "./friendshipData";
import axios from "axios";


const prisma = new PrismaClient()


beforeAll(async () => {
  await prisma.user.deleteMany();
  await prisma.user.createMany({
    data: testUsers
  })
})


// 1
describe('GET api/v1/friendships', () => {
  it('should get all paginated new frienships in descending order', async () => {
    expect(true).toBe(true);
    //
    //
    //
    //
  })
});


describe('GET api/v1/friendships/:uid', () => {

  it('should get a target frienship invitation', async () => {
    expect(true).toBe(true);
    //
    //
    //
    //
    //
  })
});


describe('GET api/v1/friendships/search', () => {
  it('should search for frienships starting with a specific username ', async () => {
    expect(true).toBe(true);
    //
    //
    //
    //
    //
  })
})


describe('POST api/v1/friendships', () => {

  it('should sent a frienship invitation', async () => {
    const sender = await prisma.user.findUnique({ where: { username: testUsers[0].username } })
    const receiver = await prisma.user.findUnique({ where: { username: testUsers[1].username } })
    const senderToken = usersJwts[0]
    const resp = await axios.post(
      '/friendships',
      { targetUserId: receiver.id },
      { headers: { 'Authorization': `Bearer ${senderToken}` } }
    )
    const newFriendship = resp.data as Friendship
    expect(resp.status).toBe(201)
    expect(newFriendship).toMatchObject({
      id: expect.any(Number),
      senderId: expect.any(Number),
      receiverId: expect.any(Number),
      status: 'PENDING',
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    })
    expect(newFriendship.senderId).toBe(sender.id)
    expect(newFriendship.receiverId).toBe(receiver.id)
  })
});


describe('PATCH api/v1/friendships?targetUserId=123', () => {

  it('should accept a frienship invitation', async () => {
    const sender = await prisma.user.findUnique({ where: { username: testUsers[2].username } })
    const receiver = await prisma.user.findUnique({ where: { username: testUsers[3].username } })
    const receiverToken = usersJwts[3]
    await prisma.friendship.create({ data: { senderId: sender.id, receiverId: receiver.id, status: 'PENDING' } });
    const resp = await axios.patch(
      `/friendships?targetUserId=${sender.id}`,
      { status: 'ACCEPTED' },
      { headers: { 'Authorization': `Bearer ${receiverToken}` } }
    )
    const acceptedFriendship = resp.data as Friendship
    expect(resp.status).toBe(200)
    expect(acceptedFriendship).toMatchObject({
      id: expect.any(Number),
      senderId: expect.any(Number),
      receiverId: expect.any(Number),
      status: 'ACCEPTED',
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    })
    expect(acceptedFriendship.senderId).toBe(sender.id)
    expect(acceptedFriendship.receiverId).toBe(receiver.id)
  })

  it('should reset (to PENDING) a frienship invitation', async () => {
    const sender = await prisma.user.findUnique({ where: { username: testUsers[4].username } })
    const receiver = await prisma.user.findUnique({ where: { username: testUsers[5].username } })
    await prisma.friendship.create({ data: { senderId: sender.id, receiverId: receiver.id, status: 'ACCEPTED' } });
    const receiverToken = usersJwts[5]
    const resp = await axios.patch(
      `/friendships?targetUserId=${sender.id}`,
      { status: 'PENDING' },
      { headers: { 'Authorization': `Bearer ${receiverToken}` } }
    )
    const acceptedFriendship = resp.data as Friendship
    expect(resp.status).toBe(200)
    expect(acceptedFriendship).toMatchObject({
      id: expect.any(Number),
      senderId: expect.any(Number),
      receiverId: expect.any(Number),
      status: 'PENDING',
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    })
    expect(acceptedFriendship.senderId).toBe(sender.id)
    expect(acceptedFriendship.receiverId).toBe(receiver.id)
  })
});


describe('DELETE api/v1/friendships?targetUserId=123', () => {

  it('should delete a frienship invitation', async () => {
    const sender = await prisma.user.findUnique({ where: { username: testUsers[6].username } })
    const receiver = await prisma.user.findUnique({ where: { username: testUsers[7].username } })
    await prisma.friendship.create({ data: { senderId: sender.id, receiverId: receiver.id, status: 'ACCEPTED' } });
    const receiverToken = usersJwts[7]
    const resp = await axios.delete(
      `/friendships?targetUserId=${sender.id}`,
      { headers: { 'Authorization': `Bearer ${receiverToken}` } }
    )
    expect(resp.status).toBe(204)
  })
});
