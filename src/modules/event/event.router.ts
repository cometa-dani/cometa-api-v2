import { Container } from 'typedi';
import likesRouter from './like/like.router';
import { authUserMiddleware } from '../../middlewares/authMiddleware';
import { validateRequestMiddleware } from '../../middlewares/validateRequestMiddleware';
import { getTargetUserEventsSchemma, searchEventsSchemma } from './event.dto';
import { EventController } from './event.controller';
import { BaseRouter } from '../../helpers/baseRouter';
import { idsSchema } from '../shared/dto/baseDTOs';


class EventRouter extends BaseRouter {
  private _eventController = Container.get(EventController);

  constructor() {
    super();
    this._initializeRoutes();
    this._router.use(likesRouter);
  }

  protected _initializeRoutes(): void {
    this._router.use(authUserMiddleware);
    // 1
    this._router.route('/')
      .get(
        validateRequestMiddleware({ query: searchEventsSchemma }),
        this._eventController.getPaginatedLatestEvent
      );

    // 2
    this._router.route('/search')
      .get(
        validateRequestMiddleware({ query: searchEventsSchemma }),
        this._eventController.searchPaginatedEventsByName
      );

    // 3
    this._router.route('/liked/:eventId') // /:eventId?likes=true
      .get(
        validateRequestMiddleware({ params: idsSchema }),
        this._eventController.getEventByID
      );

    // 4
    this._router.route('/liked')
      .get(
        validateRequestMiddleware({ query: getTargetUserEventsSchemma }),
        this._eventController.getPaginatedLikedEventsForBucketList
      );

    //  5 ?liked-by-user1=123?liked-by-user2=123
    this._router.route('/liked/matches/:uid')   // ?matches=true&targetUser=123
      .get(
        validateRequestMiddleware({ query: getTargetUserEventsSchemma, params: idsSchema }),
        this._eventController.getPaginatedMatchedEventsByTwoUsers
      );
  }
}


export default new EventRouter().getRouter();
