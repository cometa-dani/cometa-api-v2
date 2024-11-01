import { BaseController } from "../../helpers/baseController";
import Container, { Service } from "typedi";
import { EventPhotoService } from "./photo.service";
import { RequestHandlerParams } from "../../helpers/typeRequestHandlers";
import { EventService } from "../event.service";
import { IdsDto } from "../../shared/dto/baseDTOs";
import { ErrorMessage } from "../../helpers/errorMessages";


@Service()
export class PhotoController extends BaseController {
  private _eventService = Container.get(EventService);
  private _eventPhotoService = Container.get(EventPhotoService);
  private _maxNumPhotos = 3;

  public uploadEventPhotos: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const eventFound = await this._eventService.getEventById(req.params.eventId);
      if (!eventFound) {
        return this.notFound(res, ErrorMessage.EVENT_NOT_FOUND);
      }
      if (eventFound.photos.length > this._maxNumPhotos) {
        return this.conflict(res, ErrorMessage.MAX_NUMBER_OF_PHOTOS_REACHED);
      }
      const incommingImgFiles = req.files as Express.Multer.File[];
      const remainingPhotos: number = this._maxNumPhotos - eventFound.photos.length;

      if (incommingImgFiles.length > remainingPhotos) {
        return this.conflict(res, ErrorMessage.MAX_NUMBER_OF_PHOTOS_REACHED);
      }
      const startCount = eventFound.photos.length ?? 0;
      const uploadedEventPhotos = await this._eventPhotoService.uploadEventPhotos(incommingImgFiles, eventFound.id, startCount);
      if (!uploadedEventPhotos) {
        return this.conflict(res, ErrorMessage.COULD_NOT_CREATE_PHOTO);
      }
      return this.created(res, uploadedEventPhotos);
    }
    catch (error) {
      next(error);
    }
  };

  public deleteEventPhotosById: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const eventFound = await this._eventService.getEventById(req.params.eventId);
      if (!eventFound) {
        return this.notFound(res, ErrorMessage.EVENT_NOT_FOUND);
      }
      const photoToDelete = eventFound.photos.find(photo => photo.order === req.params.photoId);
      if (!photoToDelete) {
        return this.notFound(res, ErrorMessage.PHOTO_NOT_FOUND);
      }
      await this._eventPhotoService.deleteEventPhoto(eventFound.id, photoToDelete);
      return this.noContent(res);
    }
    catch (error) {
      next(error);
    }
  };

  public deleteAllPhotos: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      //
    } catch (error) {
      next(error);
    }
  };
}
