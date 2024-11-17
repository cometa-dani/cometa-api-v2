import { authUserMiddleware } from '../middlewares/authMiddleware';
import { FrienshipController } from './friendship.controller';
import { Container } from 'typedi';
import { validateRequestMiddleware } from '../middlewares/validateRequestMiddleware';
import { updateFrienshipSchemma, getAllFriendshipsSchemma } from './frienship.dto';
import { idsSchema } from '../shared/dto/baseDTOs';
import { BaseRouter } from '../helpers/baseRouter';


class FriendshipRouter extends BaseRouter {
  private _friendshipController = Container.get(FrienshipController);

  constructor() {
    super();
    this._initializeRoutes();
  }

  protected _initializeRoutes() {
    this._router.use(authUserMiddleware);
    this._router
      .route('/')
      .get(
        validateRequestMiddleware({ query: getAllFriendshipsSchemma }),
        this._friendshipController.getPaginatedNewestFriends
      )
      .post(
        validateRequestMiddleware({ body: idsSchema }),
        this._friendshipController.sentFriendShipInvitation
      );

    this._router
      .route('/search')
      .get(
        validateRequestMiddleware({ query: getAllFriendshipsSchemma }),
        this._friendshipController.searchPaginatedFriends
      );

    this._router
      .route('/:id')
      .patch(
        validateRequestMiddleware({ params: idsSchema, body: updateFrienshipSchemma }),
        this._friendshipController.updateFriendShipInvitation
      )
      .delete(
        validateRequestMiddleware({ params: idsSchema }),
        this._friendshipController.deleteFriendship
      );

    //TODO: change the route to /:id/
    this._router
      .route('/:uid')
      .get(
        validateRequestMiddleware({ params: idsSchema }),
        this._friendshipController.getFriendshipByTargetUserUUID
      ); // used in the chat
  }
}

export default new FriendshipRouter().getRouter();
