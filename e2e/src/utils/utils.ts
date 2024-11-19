import axios from "axios";
import { getRamdomStadium, stadiumEvents, stadiumsLocations } from "../server/organization/event/eventData";
import { tokenOrganization1 } from "../server/organization/organizationData";
import { Event, Location } from "@prisma/client";
import FormData from "form-data";


export const createManyLocations = async (organizationID: number) => {
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

export const createOneLocation = async (organizationID: number) => {
  const stadium = stadiumsLocations[0]
  const payload = { ...stadium, organizationId: organizationID }
  return axios.post(`/organizations/events/locations`, payload, {
    headers: {
      Authorization: `Bearer ${tokenOrganization1}`,
    }
  });
}

export const createManyEvents = async (organizationID: number, locations: Location[]) => {
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

export const createOneEvent = async (organizationID: number, location: Location) => {
  const event = stadiumEvents[0]
  const payload = {
    name: event.name,
    description: event.description,
    categories: event.categories.join(','),
    date: event.date,
    locationId: location.id,
    organizationId: organizationID
  }
  return axios.post(`/organizations/events`, payload, {
    headers: {
      Authorization: `Bearer ${tokenOrganization1}`,
    }
  });
}

export const uploadEventPhotos = async (formData: FormData, event: Event) => {
  return await axios.post(
    `/organizations/events/${event.id}/photos`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${tokenOrganization1}`,
        ...formData.getHeaders()
      }
    }
  );
}
