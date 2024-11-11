import { BaseRouter } from "../../helpers/baseRouter";
import { validateRequestMiddleware } from "../../middlewares/validateRequestMiddleware";
import { idsSchema } from "../../shared/dto/baseDTOs";
import Container from "typedi";
import { LikeController } from "./like.controller";


class LikeRouter extends BaseRouter {
  private _likeController = Container.get(LikeController);

  constructor() {
    super();
    this._initializeRoutes();
  }

  protected _initializeRoutes(): void {
    this._router.route('/:eventId/likes')
      .post(
        validateRequestMiddleware({ params: idsSchema }),
        this._likeController.createOrDeleteLikeByEvent
      );
  }
}

export default new LikeRouter().getRouter();
