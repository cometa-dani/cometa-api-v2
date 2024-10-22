import { Router } from 'express';
import { Container } from 'typedi';
import * as oldController from './_legacy/old.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequestMiddleware } from '../middlewares/validateRequestMiddleware';
import { getEventIdSchemma, getAllEventsSchemma, searchEventByNameSchemma, searchEventsSchemma, } from './event.dto';
import { EventController } from './event.controller';


export const eventRouter = Router();
const newEventController = Container.get(EventController);


eventRouter
  .route('/')
  .get(
    authMiddleware,
    validateRequestMiddleware({ query: searchEventsSchemma }),
    newEventController.searchLatestEventsWithPagination
  );


eventRouter
  .route('/search')
  .get(
    authMiddleware,
    validateRequestMiddleware({ query: searchEventByNameSchemma }),
    newEventController.searchEventsByName
  );


eventRouter
  .route('/liked/:id')
  .get(authMiddleware, oldController.getEventByID);


eventRouter
  .route('/liked')
  .get(authMiddleware, oldController.getLikedEventsForBucketListWithPagination);


// for meeting new people
eventRouter
  .route('/liked/:id/users') // eventId
  .get(
    authMiddleware,
    validateRequestMiddleware({ query: getAllEventsSchemma, params: getEventIdSchemma }),
    newEventController.getUsersWhoLikedSameEventWithPagination
  );


eventRouter
  .route('/liked/matches/:uid')
  .get(authMiddleware, oldController.getMatchedEventsByTwoUsersWithPagination);


eventRouter
  .route('/:id/like') // creates a like for the given eventID
  .post(authMiddleware, oldController.createOrDeleteLikeByEventId);


/**
 *
 * *********************************************
 * TODO: connect sub router
 * *********************************************
 */
// Sub-feature routes
// eventRouter.use('/likes', likeRouter);  // Connect the likes router
// eventRouter.use('/shares', shareRouter);  // Connect the shares router
