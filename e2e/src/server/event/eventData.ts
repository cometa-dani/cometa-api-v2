import { $Enums, PrismaClient } from "@prisma/client";
import { getRamdomStadium, stadiumEvents, stadiumsLocations } from "../organization/event/eventData";


const prisma = new PrismaClient();


export const createFootballEvents = async () => {
  const newOrganization = await prisma.organization.create({
    data: {
      name: 'Asian Cup 2',
      description: 'The best football in the entire world.',
      email: 'email@email.com',
      uid: 'asian-cup 2',
      avatarUrl: 'https://firebasestorage.googleapis.com/v0/b/cometa-e5dd5.appspot.com/o/test%2FlogoIcon.jpg?alt=media&token=ccbfa155-770b-4382-808d-0ddd6778b061&_gl=1*zkhyre*_ga*MTY4ODg0MTA0OS4xNjk3NTg2MTQ3*_ga_CW55HF8NVT*MTY5ODAwODA2NC4xNy4xLjE2OTgwMDgwOTguMjYuMC4w',
      phone: '0969711306',
      locations: {
        createMany: {
          data: stadiumsLocations.map(stadium => ({
            name: stadium.name,
            description: stadium.description,
            latitude: stadium.latitude,
            longitude: stadium.longitude,
          }))
        }
      }
    },
    include: { locations: true }
  });
  const promsifiedEvents = stadiumEvents.map(event => {
    return prisma.event.create({
      data: {
        name: event.name,
        description: event.description,
        locationId: newOrganization.locations[getRamdomStadium()].id,
        organizationId: newOrganization.id,
        date: event.date,
        categories: event.categories as $Enums.EventCategory[],
        photos: {
          create: [{
            url: event.mediaUrl,
            order: 0,
          }]
        }
      },
    });
  });

  await Promise.all(promsifiedEvents);
};
