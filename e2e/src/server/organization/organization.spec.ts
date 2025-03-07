import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { Organization, PrismaClient } from '@prisma/client';
import { testOrganization1, tokenOrganization1 } from './organizationData';
import path from 'path';


const prisma = new PrismaClient()


beforeEach(async () => {
  await prisma.organization.deleteMany();
});


afterAll(async () => {
  await prisma.organization.deleteMany(); // comment when coding
})


describe(`POST api/v1/organizations`, () => {
  it('should create a new organization', async () => {
    const response = await axios.post(`/organizations`, testOrganization1);
    expect(response.status).toBe(201);
    expect(response.data).toMatchObject({
      name: testOrganization1.name,
      description: testOrganization1.description,
      email: testOrganization1.email,
      uid: testOrganization1.uid,
    });
  });

  it('should return 409 for existing organization', async () => {
    await axios.post(`/organizations`, testOrganization1);
    try {
      await axios.post(`/organizations`, testOrganization1);
    } catch (error) {
      expect(error.response.status).toBe(409);
    }
  });

  it('should upload organization`s avatar', async () => {
    const response = await axios.post(`/organizations`, testOrganization1);
    const createdOrganization: Organization = response.data
    // Step 2: Create form data with a photo
    const formData = new FormData();
    formData.append('avatar', fs.createReadStream(path.resolve(__dirname, '..', '..', 'assets', 'events', 'logoIcon.jpg')), {
      filename: 'logoIcon.jpg',
      contentType: 'image/jpeg',
    });
    const updatedOrganization = await axios.post(
      `/organizations/${createdOrganization.id}/photos`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${tokenOrganization1}`,
          ...formData.getHeaders()
        }
      }
    );
    expect(updatedOrganization.status).toBe(200);
    expect(updatedOrganization.data).toMatchObject({
      id: expect.any(Number),
      avatarUrl: expect.any(String),
    });
    expect(updatedOrganization.data.avatarUrl).not.toBe(null);
  });
});
