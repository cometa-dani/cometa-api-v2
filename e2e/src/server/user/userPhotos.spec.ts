import axios from 'axios';
import {PrismaClient, User} from "@prisma/client";
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import {testUser1, tokenUser1} from "./userData";

const prisma = new PrismaClient()
const endpoint1 = 'users'
const endpoint2 = 'photos'


beforeEach(async () => {
  await prisma.user.deleteMany();
});


afterAll(async () => {
  await prisma.user.deleteMany();
})


describe(`POST api/v1/${endpoint1}/:id/${endpoint2}`, () => {
  it('should upload user`s photos', async () => {
    const response = await axios.post(`/${endpoint1}`, testUser1);
    const createdUser: User = response.data
    // Step 2: Create form data with a photo
    const formData = new FormData();
    formData.append('files[0]', fs.createReadStream(path.resolve(__dirname, '..', '..', 'assets', 'justin.jpg')), {
      filename: 'justin.jpg',
      contentType: 'image/jpeg',
    });
    formData.append('files[1]', fs.createReadStream(path.resolve(__dirname, '..', '..','assets', 'nicolas.jpg')), {
      filename: 'nicolas.jpg',
      contentType: 'image/jpeg',
    });
    
    const updatedUser= await axios.post(
      `/${endpoint1}/${createdUser.id}/${endpoint2}`,
      formData,
      {headers: {
        Authorization: `Bearer ${tokenUser1}`,
        ...formData.getHeaders()
      }}
    )
  });
});
