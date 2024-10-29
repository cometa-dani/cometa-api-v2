import { HttpError } from "../../helpers/httpError";
import { PrismaService } from "../../config/dataBase";
import { CloudStorageService } from "../../shared/cloudStorage/cloud-storage.service";
import Container, { Service } from "typedi";
import { EventPhoto } from "@prisma/client";


@Service()
export class EventPhotoService {
  private readonly _prismaService = Container.get(PrismaService);
  private readonly _cloudStorageService = Container.get(CloudStorageService);

  public async uploadEventPhotos(incommingImgFiles: Express.Multer.File[], eventID: number, startCount: number) {
    try {
      const eventPhotos = (
        await this._cloudStorageService.uploadManyPhotosToBucket(`events/${eventID}`, incommingImgFiles, startCount)
      );
      return this._prismaService.event.update({
        where: { id: eventID },
        data: {
          photos: {
            createMany: {
              data: eventPhotos
            }
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

  public async deleteEventPhoto(eventID: number, photoToDelete: EventPhoto) {
    const destinationPath = `events/${eventID}/photos/${photoToDelete.order}`;
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
}
