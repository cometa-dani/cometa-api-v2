import { HttpError } from "../../../../helpers/httpError";
import { PrismaService } from "../../../../config/dataBase";
import { StorageService } from "../../../shared/cloudStorage/cloud-storage.service";
import Container, { Service } from "typedi";
import { EventPhoto } from "@prisma/client";
import { IUploadedPhoto } from "../../../../modules/shared/cloudStorage/interfaces";


@Service()
export class EventPhotoService {
  private _prismaService = Container.get(PrismaService);
  private _storageService = Container.get(StorageService);

  public async saveEventPhotos(organizationId: number, incomingImgFiles: Express.Multer.File[], eventId: number, startCount: number) {
    try {
      const createdPhotos = await this._prismaService.eventPhoto.createManyAndReturn({
        data: incomingImgFiles.map((_, index) => ({ eventId, order: startCount + index }))
      });
      const photosToUpload = createdPhotos.map((photo, index) => ({
        id: photo.id,
        order: photo.order,
        file: incomingImgFiles[index],
        destinationPath: `${organizationId}/events/${eventId}/photos/${photo.id}`
      }));
      let eventPhotos: IUploadedPhoto[] = [];
      try {
        eventPhotos = await this._storageService.uploadPhotos(photosToUpload, 'organizations');
      } catch (error) {
        await this._prismaService.eventPhoto.deleteMany({
          where: { id: { in: createdPhotos.map((photo) => photo.id) } }
        });
        throw new HttpError(400, 'Uploading event photos failed' + error.message);
      }
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
      throw new HttpError(400, 'Uploading event photos failed' + error.message);
    }
  }

  public async deleteEventPhotoById(eventID: number, photoToDelete: EventPhoto) {
    const destinationPath = `events/${eventID}/photos/${photoToDelete.id}`;
    await this._storageService.deletePhotos(destinationPath, 'organizations');
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
}
