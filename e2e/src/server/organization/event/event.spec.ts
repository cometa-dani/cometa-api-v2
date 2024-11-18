import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { Event, Location, PrismaClient } from '@prisma/client';
import { testOrganization1, tokenOrganization1 } from '../organizationData';
import path from 'path';
import { stadiumEvents, getRamdomStadium, stadiumsLocations } from './eventData';


const prisma = new PrismaClient()


beforeEach(async () => {
  await prisma.organization.deleteMany();
  await prisma.event.deleteMany();
  await prisma.location.deleteMany();
});

const createLocations = async (organizationID: number) => {
  await Promise.all(
    stadiumsLocations.map((stadium) => {
      const payload = { ...stadium, organizationId: organizationID }
      return axios.post(`/organizations/events/locations`, payload, {
        headers: {
          Authorization: `Bearer ${tokenOrganization1}`,
        }
      });
    })
  )
}

const createEvents = async (organizationID: number, locations: Location[]) => {
  await Promise.all(
    stadiumEvents.map(event => {
      const payload = {
        name: event.name,
        description: event.description,
        categories: event.categories.join(','),
        date: event.date,
        locationId: locations[getRamdomStadium()].id,
        organizationId: organizationID
      }
      return axios.post(`/organizations/events`, payload, {
        headers: {
          Authorization: `Bearer ${tokenOrganization1}`,
        }
      });
    })
  )
}

describe(`POST api/v1/organizations/events`, () => {
  it('should create many locations for an organization', async () => {
    const response1 = await axios.post(`/organizations`, testOrganization1);
    const newOrganization = response1.data
    await createLocations(newOrganization.id)
    const response = await axios.get(`/organizations/${newOrganization.id}`)
    const locations = response.data?.locations as Location[]
    expect(response.status).toBe(200);
    expect(locations).toHaveLength(stadiumsLocations.length);
    locations.map(location => {
      expect(location).not.toBeNull();
      expect(location).toMatchObject({
        name: expect.any(String),
        longitude: expect.any(Number),
        latitude: expect.any(Number),
        organizationId: expect.any(Number),
      });
      expect(location.organizationId).toBe(newOrganization.id);
    });
  });

  it('should create many events for an organization', async () => {
    const response1 = await axios.post(`/organizations`, testOrganization1);
    const newOrganization = response1.data
    await createLocations(newOrganization.id)
    const response = await axios.get(`/organizations/${newOrganization.id}`)
    const locations = response.data?.locations as Location[]
    await createEvents(newOrganization.id, locations)
    const response2 = await axios.get(`/organizations/${newOrganization.id}`)
    const eventsRes = response2.data?.events as Event[]
    expect(response.status).toBe(200);
    expect(eventsRes).toHaveLength(stadiumEvents.length);
    eventsRes.map(location => {
      expect(location).not.toBeNull();
      expect(location).toMatchObject({
        name: expect.any(String),
        description: expect.any(String),
        organizationId: expect.any(Number),
        locationId: expect.any(Number),
        categories: expect.any(Array),
      });
      expect(location.organizationId).toBe(newOrganization.id);
    })
  })

  it('should upload event`s photos', async () => {
    const response1 = await axios.post(`/organizations`, testOrganization1);
    const newOrganization = response1.data
    await createLocations(newOrganization.id)
    const response3 = await axios.get(`/organizations/${newOrganization.id}`)
    const locations = response3.data?.locations as Location[]
    await createEvents(newOrganization.id, locations)
    const response = await axios.get(`/organizations/${newOrganization.id}`)
    const events = response.data?.events as Event[]
    const event = events.at(0)
    // Step 2: Create form data with a photo
    const formData = new FormData();
    formData.append('files[0]', fs.createReadStream(path.resolve(__dirname, '..', '..', '..', 'assets', 'events', '8.png')), {
      filename: '8.png',
      contentType: 'image/png',
    });
    formData.append('files[1]', fs.createReadStream(path.resolve(__dirname, '..', '..', '..', 'assets', 'events', '9.png')), {
      filename: '9.png',
      contentType: 'image/png',
    });
    const updatedEvent = await axios.post(
      `/organizations/events/${event.id}/photos`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${tokenOrganization1}`,
          ...formData.getHeaders()
        }
      }
    );
    expect(updatedEvent.status).toBe(201);
    expect(updatedEvent.data.photos).toHaveLength(2);
  });
});
