import { Router } from "express";
import { BaseRouter } from "../../helpers/baseRouter";
import { validateRequestMiddleware } from "../../middlewares/validateRequestMiddleware";
import { idsSchemma } from "../../shared/dto/baseDTOs";
import Container from "typedi";
import { LikeController } from "./like.controller";


class LikeRouter extends BaseRouter {
  protected readonly _router = Router();
  protected readonly _likeController = Container.get(LikeController);


  constructor() {
    super();
  }

  protected _initializeRoutes(): void {

    this._router.route('/')
      .post(
        validateRequestMiddleware({ params: idsSchemma }),
        this._likeController.createOrDeleteLikeByEvent
      );
  }
}

export default new LikeRouter().getRouter();
