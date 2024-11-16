import axios from 'axios';
import { PrismaClient, User, UserPhoto } from "@prisma/client";
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { testUser1, tokenUser1 } from "./userData";

const prisma = new PrismaClient()


beforeEach(async () => {
  await prisma.user.deleteMany();
});


describe(`POST api/v1/users/:id/photos`, () => {
  it('should upload user`s photos', async () => {
    const response = await axios.post(`/users`, testUser1);
    const createdUser: User = response.data
    // Step 2: Create form data with a photo
    const formData = new FormData();
    formData.append('files[0]', fs.createReadStream(path.resolve(__dirname, '..', '..', 'assets', 'justin.jpg')), {
      filename: 'justin.jpg',
      contentType: 'image/jpeg',
    });
    formData.append('files[1]', fs.createReadStream(path.resolve(__dirname, '..', '..', 'assets', 'nicolas.jpg')), {
      filename: 'nicolas.jpg',
      contentType: 'image/jpeg',
    });
    const updatedUser = await axios.post(
      `/users/${createdUser.id}/photos`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${tokenUser1}`,
          ...formData.getHeaders()
        }
      }
    );
    expect(updatedUser.status).toBe(201);
    expect(updatedUser.data).toMatchObject({
      id: expect.any(Number),
      photos: expect.any(Array),
    })
    const photos: UserPhoto[] = updatedUser.data.photos
    expect(photos).toHaveLength(2)
    photos.forEach((photo: UserPhoto) => {
      expect(photo).toMatchObject({
        id: expect.any(Number),
        userId: createdUser.id,  // should be the same
        url: expect.any(String),
        placeholder: expect.any(String),
        order: expect.any(Number),
      })
    })
  });

  // TODO: add tests for deleting photos
  it('should keep the order of the photos', async () => {
    const response = await axios.post(`/users`, testUser1);
    const createdUser: User = response.data
    // Step 2: Create form data with a photo
    const formData = new FormData();
    const photo1 = fs.createReadStream(path.resolve(__dirname, '..', '..', 'assets', 'justin.jpg'));
    const photo2 = fs.createReadStream(path.resolve(__dirname, '..', '..', 'assets', 'nicolas.jpg'));
    formData.append('files[0]', photo1, {
      filename: 'justin.jpg',
      contentType: 'image/jpeg',
    });
    formData.append('files[1]', photo2, {
      filename: 'nicolas.jpg',
      contentType: 'image/jpeg',
    });
    formData.append('files[2]', photo1, {
      filename: 'justin.jpg',
      contentType: 'image/jpeg',
    });
    formData.append('files[3]', photo2, {
      filename: 'nicolas.jpg',
      contentType: 'image/jpeg',
    });
    formData.append('files[4]', photo1, {
      filename: 'justin.jpg',
      contentType: 'image/jpeg',
    })

    const  updatedUser = await axios.post(
      `/users/${createdUser.id}/photos`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${tokenUser1}`,
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
        }
      }
    );
    expect(updatedUser.status).toBe(201);
    expect(updatedUser.data).toMatchObject({
      id: expect.any(Number),
      photos: expect.any(Array),
    })
    const photos: UserPhoto[] = updatedUser.data.photos
    expect(photos).toHaveLength(5)
    photos.forEach((photo: UserPhoto, index: number) => {
      expect(photo).toMatchObject({
        id: expect.any(Number),
        userId: createdUser.id,  // should be the same
        url: expect.any(String),
        placeholder: expect.any(String),
        order: index,
      })
    })
  }, 30_000);
});
