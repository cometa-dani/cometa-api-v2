import { Router } from "express";
import Container from "typedi";
import { PhotoController } from "./photo.controller";
import { BaseRouter } from "../../helpers/baseRouter";
import { imageUploadMiddleware } from "../../middlewares/imageUploadMiddleware";
import { validateRequestMiddleware } from "../../middlewares/validateRequestMiddleware";
import { idsSchemma } from "../../shared/dto/baseDTOs";


class PhotoRouter extends BaseRouter {
  protected readonly _router = Router();
  protected readonly _eventPhotoController = Container.get(PhotoController);

  constructor() {
    super();
  }

  protected _initializeRoutes() {
    this._router
      .route('/')
      .post(
        imageUploadMiddleware.any(),
        validateRequestMiddleware({ params: idsSchemma }),
        this._eventPhotoController.uploadEventPhotos
      );

    this._router
      .route('/:photoId')
      .delete(
        validateRequestMiddleware({ params: idsSchemma }),
        this._eventPhotoController.deleteEventPhotosById
      );
  }
}

export default new PhotoRouter().getRouter();
