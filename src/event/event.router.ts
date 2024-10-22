import { Router } from 'express';
import { Container } from 'typedi';
import * as oldController from './_legacy/old.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequestMiddleware } from '../middlewares/validateRequestMiddleware';
import { getEventIdSchemma, getAllEventsSchemma, searchEventByNameSchemma, searchEventsSchemma, } from './event.dto';
import { EventController } from './event.controller';


/**
 *
 * *********************************************
 * TODO: connect sub router
 * *********************************************
 *  Sub-feature routes
 * eventRouter.use('/likes', likeRouter);  // Connect the likes router
 * eventRouter.use('/shares', shareRouter);  // Connect the shares router
 */
class EventRouter {

  private _router: Router = Router();
  private _eventController = Container.get(EventController);

  constructor() {
    this._initializeRoutes();
  }

  private _initializeRoutes(): void {
    this._router
      .route('/')
      .get(
        authMiddleware,
        validateRequestMiddleware({ query: searchEventsSchemma }),
        this._eventController.searchLatestEventsWithPagination
      );

    this._router
      .route('/search')
      .get(
        authMiddleware,
        validateRequestMiddleware({ query: searchEventByNameSchemma }),
        this._eventController.searchEventsByName
      );

    this._router
      .route('/liked')
      .get(
        authMiddleware,
        this._eventController.getLikedEventsForBucketListWithPagination
      );

    this._router
      .route('/liked/:id')
      .get(
        authMiddleware,
        validateRequestMiddleware({ params: getEventIdSchemma }),
        this._eventController.getEventByID
      );

    this._router
      .route('/liked/:id/users')
      .get(
        authMiddleware,
        validateRequestMiddleware({ query: getAllEventsSchemma, params: getEventIdSchemma }),
        this._eventController.getUsersWhoLikedSameEventWithPagination
      );

    this._router
      .route('/liked/matches/:uid')
      .get(
        authMiddleware,
        oldController.getMatchedEventsByTwoUsersWithPagination
      );

    this._router
      .route('/:id/like') // creates a like for the given eventID
      .post(
        authMiddleware,
        oldController.createOrDeleteLikeByEventId
      );
  }

  public getRouter(): Router {
    return this._router;
  }
}


export default new EventRouter().getRouter();
