import Container from "typedi";
import { PhotoController } from "./photo.controller";
import { BaseRouter } from "../../../../helpers/baseRouter";
import { imageUploadMiddleware } from "../../../../middlewares/imageUploadMiddleware";
import { validateRequestMiddleware } from "../../../../middlewares/validateRequestMiddleware";
import { idsSchema } from "../../../shared/dto/baseDTOs";


class EventPhotoRouter extends BaseRouter {
  private _eventPhotoController = Container.get(PhotoController);

  constructor() {
    super();
    this._initializeRoutes();
  }

  protected _initializeRoutes() {
    this._router
      .route('/:organizationId/events/:eventId?/photos')
      .post(
        imageUploadMiddleware.array('files'),
        validateRequestMiddleware({ params: idsSchema }),
        this._eventPhotoController.uploadEventPhotos
      );

    this._router
      .route(':organizationId/events/:eventId?/photos/:photoId')
      .delete(
        validateRequestMiddleware({ params: idsSchema }),
        this._eventPhotoController.deleteEventPhotosById
      );
  }
}

export default new EventPhotoRouter().getRouter();
