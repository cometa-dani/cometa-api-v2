import Container from "typedi";
import { PhotoController } from "./photo.controller";
import { BaseRouter } from "../../helpers/baseRouter";
import { imageUploadMiddleware } from "@/middlewares/imageUploadMiddleware";
import { validateRequestMiddleware } from "@/middlewares/validateRequestMiddleware";
import { idsSchema } from "@/shared/dto/baseDTOs";


class PhotoRouter extends BaseRouter {
  private readonly _eventPhotoController = Container.get(PhotoController);

  constructor() {
    super();
  }

  protected _initializeRoutes() {
    this._router
      .route('/')
      .post(
        imageUploadMiddleware.any(),
        validateRequestMiddleware({ params: idsSchema }),
        this._eventPhotoController.uploadEventPhotos
      );

    this._router
      .route('/:photoId')
      .delete(
        validateRequestMiddleware({ params: idsSchema }),
        this._eventPhotoController.deleteEventPhotosById
      );
  }
}

export default new PhotoRouter().getRouter();
