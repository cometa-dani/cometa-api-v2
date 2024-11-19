import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { Event, EventPhoto, Location, PrismaClient } from '@prisma/client';
import { testOrganization1, tokenOrganization1 } from '../organizationData';
import path from 'path';
import { stadiumEvents, stadiumsLocations } from './eventData';
import {
  createManyEvents,
  createManyLocations,
  createOneEvent,
  createOneLocation,
  uploadEventPhotos
} from '../../../utils/utils';


const prisma = new PrismaClient()


beforeEach(async () => {
  await prisma.organization.deleteMany();
  await prisma.event.deleteMany();
  await prisma.location.deleteMany();
});


const createFormData = (): FormData => {
  const formData = new FormData();
  formData.append('files[0]', fs.createReadStream(path.resolve(__dirname, '..', '..', '..', 'assets', 'events', '8.png')), {
    filename: '8.png',
    contentType: 'image/png',
  });
  formData.append('files[1]', fs.createReadStream(path.resolve(__dirname, '..', '..', '..', 'assets', 'events', '9.png')), {
    filename: '9.png',
    contentType: 'image/png',
  });

  return formData
}


describe(`POST api/v1/organizations/events`, () => {
  it('should create many locations for an organization', async () => {
    const response1 = await axios.post(`/organizations`, testOrganization1);
    const newOrganization = response1.data
    await createManyLocations(newOrganization.id)
    const response2 = await axios.get(`/organizations/${newOrganization.id}`)
    const locations = response2.data?.locations as Location[]
    expect(response2.status).toBe(200);
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
    await createManyLocations(newOrganization.id)
    const response2 = await axios.get(`/organizations/${newOrganization.id}`)
    const locations = response2.data?.locations as Location[]
    await createManyEvents(newOrganization.id, locations)
    const response3 = await axios.get(`/organizations/${newOrganization.id}`)
    const eventsRes = response3.data?.events as Event[]
    expect(response3.status).toBe(200);
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
    await createOneLocation(newOrganization.id)
    const response2 = await axios.get(`/organizations/${newOrganization.id}`)
    const locations = response2.data?.locations as Location[]
    await createOneEvent(newOrganization.id, locations.at(0))
    const response3 = await axios.get(`/organizations/${newOrganization.id}`)
    const events = response3.data?.events as Event[]
    const event = events.at(0)
    // Step 2: Create form data with a photo
    const formData = createFormData();
    const updatedEvent = await uploadEventPhotos(formData, event)
    expect(updatedEvent.status).toBe(201);
    expect(updatedEvent.data.photos).toHaveLength(2);
  });
});


describe('DELETE api/v1/organizations/events/:eventId/photos/:photoId', () => {
  it('should delete a photo by id', async () => {
    const response1 = await axios.post(`/organizations`, testOrganization1);
    const newOrganization = response1.data
    await createOneLocation(newOrganization.id)
    const response2 = await axios.get(`/organizations/${newOrganization.id}`)
    const locations = response2.data?.locations as Location[]
    await createOneEvent(newOrganization.id, locations.at(0))
    const response3 = await axios.get(`/organizations/${newOrganization.id}`)
    const event = response3.data?.events?.at(0) as Event

    const formData = createFormData();
    const updatedEvent = await uploadEventPhotos(formData, event)
    const photo = updatedEvent.data?.photos?.at(0) as EventPhoto
    expect(updatedEvent.data.photos).toHaveLength(2);
    const deletedPhoto = await axios.delete(`/organizations/events/${event.id}/photos/${photo.id}`, {
      headers: {
        Authorization: `Bearer ${tokenOrganization1}`,
      }
    });
    expect(deletedPhoto.status).toBe(204);
    expect(deletedPhoto.data).toBe("");

    const response4 = await prisma.eventPhoto.findMany({ where: { eventId: event.id } })
    expect(response4).toHaveLength(1);
  });

  it('should delete all photos when deleting an event', async () => {
    const response1 = await axios.post(`/organizations`, testOrganization1);
    const newOrganization = response1.data
    await createOneLocation(newOrganization.id)
    const response2 = await axios.get(`/organizations/${newOrganization.id}`)
    const locations = response2.data?.locations as Location[]
    await createOneEvent(newOrganization.id, locations.at(0))
    const response3 = await axios.get(`/organizations/${newOrganization.id}`)
    const event = response3.data?.events?.at(0) as Event

    const formData = createFormData();
    const updatedEvent = await uploadEventPhotos(formData, event)
    expect(updatedEvent.data.photos).toHaveLength(2);
    const deletedEvent = await axios.delete(`/organizations/events/${event.id}`, {
      headers: {
        Authorization: `Bearer ${tokenOrganization1}`,
      }
    });
    expect(deletedEvent.status).toBe(204);
    expect(deletedEvent.data).toBe("");
    const response4 = await prisma.eventPhoto.findMany({ where: { eventId: event.id } })
    expect(response4).toHaveLength(0);
  });
})

// TODO:
// delete organization by id (events, likes, shares, photos, locations)
// chatApp
