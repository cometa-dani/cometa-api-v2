import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { FrienshipController } from './friendship.controller';
import { Container } from 'typedi';
import { validateRequestMiddleware } from '../middlewares/validateRequestMiddleware';
import { paramsSchemma, updateBodySchemma, paginatedQueries } from './frienship.dto';


class FrienshipRouter {

  private _router = Router();
  private _frienshipController = Container.get(FrienshipController);


  constructor() {
    this._initializeRoutes();
  }


  private _initializeRoutes() {

    this._router
      .route('/')
      .get(
        authMiddleware,
        validateRequestMiddleware({ query: paginatedQueries }),
        this._frienshipController.getNewestFriendsWithPagination
      )
      .post(
        authMiddleware,
        validateRequestMiddleware({ body: paramsSchemma }),
        this._frienshipController.sentFriendShipInvitation
      );


    this._router
      .route('/search')
      .get(
        authMiddleware,
        validateRequestMiddleware({ query: paginatedQueries }),
        this._frienshipController.searchFriendsWithPagination
      );


    this._router
      .route('/:id')
      .delete(
        authMiddleware,
        validateRequestMiddleware({ params: paramsSchemma }),
        this._frienshipController.deleteFriendship
      )
      .patch(
        authMiddleware,
        validateRequestMiddleware({ params: paramsSchemma, body: updateBodySchemma }),
        this._frienshipController.updateFriendShipInvitation
      );


    //TODO: change the route to /:id/
    this._router
      .route('/:uuid')
      .get(
        authMiddleware,
        validateRequestMiddleware({ params: paramsSchemma }),
        this._frienshipController.getFriendshipByTargetUserUUID
      ); // used in the chat
  }


  public getRouter() {
    return this._router;
  }
}

export default new FrienshipRouter().getRouter();
