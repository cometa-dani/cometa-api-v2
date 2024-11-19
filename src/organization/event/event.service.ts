import { Event } from "@prisma/client";
import { PrismaService } from "../../config/dataBase";
import { CloudStorageService } from "../../shared/cloudStorage/cloud-storage.service";
import Container, { Service } from "typedi";
import { CreateEventDto, UpdateEventDto } from "./event.dto";


@Service()
export class EventService {
  private _prismaService = Container.get(PrismaService);
  private _cloudStorageService = Container.get(CloudStorageService);

  public async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    return this._prismaService.event.create({
      data: {
        name: createEventDto.name,
        categories: createEventDto.categories,
        description: createEventDto.description,
        date: createEventDto.date,
        locationId: createEventDto.locationId,
        organizationId: createEventDto.organizationId
      }
    });
  }

  public async updateEvent(eventId: number, updateEventDto: UpdateEventDto): Promise<Event> {
    return this._prismaService.event.update({
      where: { id: eventId },
      data: updateEventDto
    });
  }

  public async deleteEvent(eventId: number, photosIds: number[]) {
    if (photosIds.length === 0) return;
    return Promise.all([
      this._prismaService.event.delete({ where: { id: eventId } }),
      photosIds.map((photoId) => {
        return this._cloudStorageService.deletePhotoFromBucket(`events/${eventId}/photos/${photoId}`);
      })
    ]);
  }
}
