import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { FrienshipController } from './friendship.controller';
import { Container } from 'typedi';
import { validateRequestMiddleware } from '../middlewares/validateRequestMiddleware';
import { updateFrienshipSchemma, getAllFriendshipsSchemma } from './frienship.dto';
import { idsSchemma } from '../shared/dto/baseDTOs';
import { BaseRouter } from '../helpers/baseRouter';


class FrienshipRouter extends BaseRouter {
  protected _router = Router();
  protected _frienshipController = Container.get(FrienshipController);

  protected _initializeRoutes() {
    this._router.use(authMiddleware);

    this._router
      .route('/')
      .get(
        validateRequestMiddleware({ query: getAllFriendshipsSchemma }),
        this._frienshipController.getPaginatedNewestFriends
      )
      .post(
        validateRequestMiddleware({ body: idsSchemma }),
        this._frienshipController.sentFriendShipInvitation
      );

    this._router
      .route('/search')
      .get(
        validateRequestMiddleware({ query: getAllFriendshipsSchemma }),
        this._frienshipController.searchPaginatedFriends
      );

    this._router
      .route('/:id')
      .patch(
        validateRequestMiddleware({ params: idsSchemma, body: updateFrienshipSchemma }),
        this._frienshipController.updateFriendShipInvitation
      )
      .delete(
        validateRequestMiddleware({ params: idsSchemma }),
        this._frienshipController.deleteFriendship
      );

    //TODO: change the route to /:id/
    this._router
      .route('/:uid')
      .get(
        validateRequestMiddleware({ params: idsSchemma }),
        this._frienshipController.getFriendshipByTargetUserUUID
      ); // used in the chat
  }
}

export default new FrienshipRouter().getRouter();
