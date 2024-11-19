import { HttpError } from "../../../../helpers/httpError";
import { PrismaService } from "../../../../config/dataBase";
import { CloudStorageService } from "../../../shared/cloudStorage/cloud-storage.service";
import Container, { Service } from "typedi";
import { EventPhoto } from "@prisma/client";


@Service()
export class EventPhotoService {
  private _prismaService = Container.get(PrismaService);
  private _cloudStorageService = Container.get(CloudStorageService);

  public async saveEventPhotos(incomingImgFiles: Express.Multer.File[], eventId: number, startCount: number) {
    try {
      const createdPhotos = await this._prismaService.eventPhoto.createManyAndReturn({
        data: incomingImgFiles.map((_, index) => ({ eventId, order: startCount + index }))
      });
      const photosToUpload = createdPhotos.map((photo, index) => ({
        id: photo.id,
        order: photo.order,
        file: incomingImgFiles[index],
        destinationPath: `events/${eventId}/photos/${photo.id}`
      }));
      const eventPhotos = await this._cloudStorageService.uploadPhotosToBucket(photosToUpload);
      return this._prismaService.event.update({
        where: { id: eventId },
        data: {
          photos: {
            updateMany: eventPhotos.map((photo) => ({
              where: { id: photo.id },
              data: {
                url: photo.url,
                placeholder: photo.placeholder,
                order: photo.order
              }
            }))
          }
        },
        include: {
          photos: true
        }
      });
    } catch (error) {
      throw new HttpError(500, 'Uploading event photos failed' + error.message);
    }
  }

  public async deleteEventById(eventId: number, photosIds: number[]) {
    return Promise.all([
      this._prismaService.event.delete({ where: { id: eventId } }), // photos will be deleted automatically
      this._deleteAllEventPhotosFromBucket(eventId, photosIds)
    ]);
  }

  public async deleteEventPhotoById(eventID: number, photoToDelete: EventPhoto) {
    const destinationPath = `events/${eventID}/photos/${photoToDelete.id}`;
    await this._cloudStorageService.deletePhotoFromBucket(destinationPath);
    await this._prismaService.eventPhoto.delete({ where: { id: photoToDelete.id } });
    return this._prismaService.eventPhoto.updateMany({
      where: {
        eventId: photoToDelete.eventId,
        order: { gte: photoToDelete.order } // reorders the remaining photos
      },
      data: {
        order: { decrement: 1 }  // reorders the remaining photos
      }
    });
  }

  private async _deleteAllEventPhotosFromBucket(eventID: number, photosIds: number[]) {
    if (photosIds.length === 0) return;
    return Promise.all(
      photosIds.map((photoId) => {
        return this._cloudStorageService.deletePhotoFromBucket(`events/${eventID}/photos/${photoId}`);
      }));
  }
}
