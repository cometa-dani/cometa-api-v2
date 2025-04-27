import { Event } from "@prisma/client";
import { PrismaService } from "../../../config/dataBase";
import { StorageService } from "../../shared/cloudStorage/cloud-storage.service";
import Container, { Service } from "typedi";
import { CreateEventDto, UpdateEventDto } from "./event.dto";


@Service()
export class EventService {
  private _prismaService = Container.get(PrismaService);
  private _storageService = Container.get(StorageService);

  public getAllEvents(organizationId: number) {
    return this._prismaService.event.findMany({
      where: {
        organizationId
      },
      include: { photos: true, location: true },
      orderBy: { id: 'desc' }
    });
  }

  public getEventById(id: number) {
    return this._prismaService.event.findUnique({
      where: { id },
      include: { photos: true }
    });
  }

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

  public async deleteEvent(eventID: number, photosIds: number[]) {
    return Promise.all([
      this._prismaService.event.delete({ where: { id: eventID } }),  // photos will be deleted automatically
      this._deleteAllEventPhotosFromBucket(eventID, photosIds)
    ]);
  }

  private async _deleteAllEventPhotosFromBucket(eventId: number, photosIds: number[]) {
    if (photosIds.length === 0) return;
    return Promise.all(
      photosIds.map((photoId) => {
        return this._storageService.deletePhotos(`events/${eventId}/photos/${photoId}`, 'organizations');
      }));
  }
}
