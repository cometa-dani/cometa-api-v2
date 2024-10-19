import { Router } from 'express';
import { Container } from 'typedi';
import * as oldController from './_legacy/old.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequestMiddleware } from '../middlewares/validateRequestMiddleware';
import { schemmaEventIdParams, schemmaEventQueriesWithPagination, schemmaSearchByName, searchEventsByQueryParams, } from './event.dto';
import { EventController } from './event.controller';


export const eventRouter = Router();
const newEventController = Container.get(EventController);


eventRouter
  .route('/')
  .get(
    authMiddleware,
    validateRequestMiddleware({ query: searchEventsByQueryParams }),
    newEventController.searchLatestEventsWithPagination
  )
  // change to 'locations/:id/events' in location model
  // or pass a ?locationID=1 as queryParam
  .post(newEventController.createEventByLocation);


eventRouter
  .route('/search')
  .get(
    authMiddleware,
    validateRequestMiddleware({ query: schemmaSearchByName }),
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
  .route('/liked/:id/users')
  .get(
    authMiddleware,
    validateRequestMiddleware({ query: schemmaEventQueriesWithPagination, params: schemmaEventIdParams }),
    newEventController.getUsersWhoLikedSameEventWithPagination
  );


eventRouter
  .route('/liked/matches/:uid')
  .get(authMiddleware, oldController.getMatchedEventsByTwoUsersWithPagination);


eventRouter
  .route('/:id/like') // creates a like for the given eventID
  .post(authMiddleware, oldController.createOrDeleteLikeByEventId);
