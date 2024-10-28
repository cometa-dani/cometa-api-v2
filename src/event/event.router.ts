import { Router } from 'express';
import { Container } from 'typedi';
import * as oldController from './_legacy/old.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequestMiddleware } from '../middlewares/validateRequestMiddleware';
import { createEventSchemma, getTargetUserEventsSchemma, searchEventsSchemma, updateEventSchemma, } from './event.dto';
import { EventController } from './event.controller';
import { BaseRouter } from '../helpers/baseRouter';
import photoRouter from './photo/photo.router';
import { idsSchemma } from '../shared/dto/baseDTOs';
import locationRouter from './location/location.router';


/**
 *
 * *********************************************
 * TODO: connect sub router
 * *********************************************
 *  Sub-feature routes
 * eventRouter.use('/likes', likeRouter);  // Connect the likes router
 * eventRouter.use('/shares', shareRouter);  // Connect the shares router
 */
class EventRouter extends BaseRouter {
  protected _router: Router = Router();
  protected _eventController = Container.get(EventController);

  constructor() {
    super();
    this._router.use('/:eventId?/photos', photoRouter);
    this._router.use('/:eventId?/locations', locationRouter);
    // this._router.use('/likes', likesRouter);
  }

  protected _initializeRoutes(): void {
    this._router.use(authMiddleware);

    this._router.route('/')
      .get(
        validateRequestMiddleware({ query: searchEventsSchemma }),
        this._eventController.searchLatestEventsWithPagination
      )
      .post(
        validateRequestMiddleware({ body: createEventSchemma }),
        this._eventController.createEvent
      );

    this._router.route('/:eventId')
      .patch(
        validateRequestMiddleware({ body: updateEventSchemma, params: idsSchemma }),
        this._eventController.updateEvent
      )
      .delete(
        validateRequestMiddleware({ params: idsSchemma }),
        this._eventController.deleteEvent
      );

    this._router.route('/search')
      .get(
        validateRequestMiddleware({ query: searchEventsSchemma }),
        this._eventController.searchEventsByName
      );

    this._router.route('/liked')  // change to ?liked=true&targetUser=123
      .get(
        validateRequestMiddleware({ query: getTargetUserEventsSchemma }),
        this._eventController.getLikedEventsForBucketListWithPagination
      );

    this._router
      .route('/liked/:eventId') // /:eventId?likes=true
      .get(
        validateRequestMiddleware({ params: idsSchemma }),
        this._eventController.getEventByID
      );

    // TODO: move to users folder
    this._router.route('/liked/:eventId/users') // ? liked-same-event=8772
      .get(
        validateRequestMiddleware({ query: getTargetUserEventsSchemma, params: idsSchemma }),
        this._eventController.getUsersWhoLikedSameEventWithPagination
      );

    this._router.route('/liked/matches/:uid')   // ?matches=true&targetUser=123
      .get(
        oldController.getMatchedEventsByTwoUsersWithPagination
      );

    this._router.route('/:eventId/like') // creates a like for the given eventID
      .post(
        oldController.createOrDeleteLikeByEventId
      );
  }
}


export default new EventRouter().getRouter();
