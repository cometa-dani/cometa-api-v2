import { BaseRouter } from "../../helpers/baseRouter";
import { validateRequestMiddleware } from "../../middlewares/validateRequestMiddleware";
import { idsSchema } from "../../shared/dto/baseDTOs";
import Container from "typedi";
import { LikeController } from "./like.controller";


class LikeRouter extends BaseRouter {
  private readonly _likeController = Container.get(LikeController);

  constructor() {
    super();
  }

  protected _initializeRoutes(): void {

    this._router.route('/')
      .post(
        validateRequestMiddleware({ params: idsSchema }),
        this._likeController.createOrDeleteLikeByEvent
      );
  }
}

export default new LikeRouter().getRouter();
