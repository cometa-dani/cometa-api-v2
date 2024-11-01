import { Container } from 'typedi';
import likesRouter from './like/like.router';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequestMiddleware } from '../middlewares/validateRequestMiddleware';
import { createEventSchemma, getTargetUserEventsSchemma, searchEventsSchemma, updateEventSchemma, } from './event.dto';
import { EventController } from './event.controller';
import { BaseRouter } from '../helpers/baseRouter';
import photoRouter from './photo/photo.router';
import { idsSchema } from '../shared/dto/baseDTOs';
import locationRouter from './location/location.router';


class EventRouter extends BaseRouter {
  private readonly _eventController = Container.get(EventController);

  constructor() {
    super();
    this._router.use('/:eventId?/photos', photoRouter);
    this._router.use('/:eventId?/locations', locationRouter);
    this._router.use('/:eventId?/likes', likesRouter);
  }

  protected _initializeRoutes(): void {
    this._router.use(authMiddleware);

    this._router.route('/')
      .get(
        validateRequestMiddleware({ query: searchEventsSchemma }),
        this._eventController.getPaginatedLatestEvent
      )
      .post(
        validateRequestMiddleware({ body: createEventSchemma }),
        this._eventController.createEvent
      );

    this._router.route('/:eventId')
      .patch(
        validateRequestMiddleware({ body: updateEventSchemma, params: idsSchema }),
        this._eventController.updateEvent
      )
      .delete(
        validateRequestMiddleware({ params: idsSchema }),
        this._eventController.deleteEvent
      );

    this._router.route('/search')
      .get(
        validateRequestMiddleware({ query: searchEventsSchemma }),
        this._eventController.searchPaginatedEventsByName
      );

    /**
     *
     * ******************************************
     * TODO: change query params & (delete 'liked' segment)
     * ******************************************
     */
    this._router.route('/liked/matches/:uid')   // ?matches=true&targetUser=123
      .get(
        validateRequestMiddleware({ query: getTargetUserEventsSchemma, params: idsSchema }),
        this._eventController.getPaginatedMatchedEventsByTwoUsers
      );

    this._router.route('/liked')  // change to ?liked=true&targetUser=123
      .get(
        validateRequestMiddleware({ query: getTargetUserEventsSchemma }),
        this._eventController.getPaginatedLikedEventsForBucketList
      );

    this._router.route('/liked/:eventId') // /:eventId?likes=true
      .get(
        validateRequestMiddleware({ params: idsSchema }),
        this._eventController.getEventByID
      );

    // /**
    //  *
    //  * ******************************************
    //  * TODO: move to likes folder
    //  * ******************************************
    //  */
    // this._router.route('/:eventId/like') // creates a like for the given eventID
    //   .post(
    //     // oldController.createOrDeleteLikeByEventId
    //   );

    /**
     *
     * ******************************************
     * TODO: move to users folder
     * ******************************************
     */
    this._router.route('/liked/:eventId/users') // ? liked-same-event=8772
      .get(
        validateRequestMiddleware({ query: getTargetUserEventsSchemma, params: idsSchema }),
        this._eventController.getPaginatedUsersWhoLikedSameEvent
      );
  }
}


export default new EventRouter().getRouter();
