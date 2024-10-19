import { prisma } from '../../dataBaseConnection';
import { RequestHandler } from 'express';
import * as schemma from '../event.dto';
import { Prisma, Event } from '@prisma/client';
import { configCursor } from '../../helpers/configCursor';


interface ILikeableEvent extends Event {
  isLiked: boolean;
}

/**
 * Get the latest events with pagination.
 *
 * This function retrieves the latest events from the database with support for pagination.
 *
 * @function
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 *
 * @returns {void}
 */
export const getAllLatestEventsWithPagination: RequestHandler = async (req, res, next) => {
  try {
    // parsing queryParams
    const reqQueryParams = schemma.schemmaEventQueriesWithPagination.safeParse(req.query);

    // handles validation
    if (!reqQueryParams.success) {
      return res.status(400).json({ error: 'Validation failed', issues: reqQueryParams['error'].issues });
    }
    const { limit, cursor, categories } = reqQueryParams.data;

    const query: Prisma.EventFindManyArgs = {
      ...configCursor(limit, cursor),
      where: categories?.length > 0 ? { categories: { hasSome: categories } } : undefined,
      include: {
        // counts all the likes for a given event
        _count: {
          select: {
            likes: true,
            shares: true
          }
        },
        likes: {
          // 1 or 0 times if the user has liked the event
          where: { userId: req.user.id },
        },
        // organization: true,
        location: true,
        photos: true
      }
    };

    // concurrent database query
    const [totalEventsCount, latestEvents] = (
      await
        Promise.all([
          prisma.event.count({ where: categories?.length > 0 ? { categories: { hasSome: categories } } : undefined }),  // counting all records in the entire table
          prisma.event.findMany(query),
        ])
    );

    const latestLikabledEvents: ILikeableEvent[] = latestEvents.map(event => {
      return {
        ...event,
        // if the users'ID appears once in the likes array, then true otherwise false
        isLiked: event['likes'].length === 1 && event['likes'][0]?.userId === req.user.id,
      };
    });

    // since we are counting down from the latest items in the table,
    // when we reach the first item, we should stop looking for the next cursor.
    const nextCursor = latestLikabledEvents.at(-1)?.id === 1 ? null : latestLikabledEvents.at(-1)?.id ?? null;
    res
      .status(200)
      .json({
        events: cursor > 0 ? latestLikabledEvents.slice(1) : latestLikabledEvents,
        totalEvents: totalEventsCount,
        nextCursor,
        eventsPerPage: limit,
      });
  }
  catch (error) {
    next(error);
  }
};


/**
 * @description Get the latest liked events with pagination for bucketList.
 *
 * @function
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 *
 * @returns {void}
 */
export const getLikedEventsForBucketListWithPagination: RequestHandler = async (req, res, next) => {
  try {
    // parsing queryParams
    const reqQueryParams = schemma.schemmaEventQueriesWithPagination.safeParse(req.query);

    // handles validation
    if (!reqQueryParams.success) {
      return res.status(400).json({ error: 'Validation failed', issues: reqQueryParams['error'].issues });
    }
    const { limit, cursor, userId: secondUserID } = reqQueryParams.data;
    const lookForSecondUserById = req.user?.id && secondUserID ? true : false;
    const userIdToLookFor = lookForSecondUserById ? secondUserID : req.user?.id;
    const whereCondition = { userId: userIdToLookFor };

    let latestLikedEvents: ILikeableEvent[];
    let totalEventsCount: number;

    if (lookForSecondUserById) {
      const [eventsWithAllPhotos, eventsCount] = await Promise.all([

        prisma.eventLike.findMany({
          ...configCursor(limit, cursor),
          where: whereCondition,
          select: {
            event: {
              include: {
                location: true,
                likes: { where: { userId: req.user.id } },
                photos: true,
                _count: {
                  select: {
                    likes: true,
                    shares: true
                  }
                }
              },
            }
          },
        }),

        prisma.eventLike.count({ where: whereCondition }),
      ]);

      latestLikedEvents = eventsWithAllPhotos.map(({ event }) => {
        return {
          ...event,
          isLiked: event.likes?.length === 1, // because we are getting only the liked events
        };
      });
      totalEventsCount = eventsCount;
    }
    else {
      const [eventsWithAllPhotos, eventsCount] = await Promise.all([

        prisma.eventLike.findMany({
          orderBy: { id: 'desc' },
          take: cursor > 0 ? limit + 1 : limit, // only adds 1 when limit is greater than 0
          cursor: cursor > 0 ? { id: cursor } : undefined, // makes pagination
          where: whereCondition,
          select: {
            event: {
              include: {
                photos: { take: 1, where: { order: 0 } },
                likes: {
                  take: 3,
                  where: {
                    // get all the users's likes except the authenticated user's
                    NOT: whereCondition
                  },
                  select: {
                    user: {
                      select: { photos: { take: 1, where: { order: 0 } } }
                    }
                  }
                }
              },
            }
          },
        }),

        prisma.eventLike.count({ where: whereCondition }),
      ]);

      latestLikedEvents = eventsWithAllPhotos.map(({ event }) => {
        return {
          ...event,
          isLiked: true, // because we are getting only the liked events by a same user
        };
      });
      totalEventsCount = eventsCount;
    }
    // since we are counting down from the latest items in the table,
    // when we reach the first item, we should stop looking for the next cursor.
    const nextCursor = latestLikedEvents.at(-1)?.id === 1 ? null : latestLikedEvents.at(-1)?.id ?? null;
    res
      .status(200)
      .json({
        events: cursor > 0 ? latestLikedEvents.slice(1) : latestLikedEvents,
        totalEvents: totalEventsCount,
        nextCursor,
        eventsPerPage: limit,
      });
  }
  catch (error) {
    next(error);
  }
};


/**
 * Get all users who have liked event by eventId.
 *
 * This function retrieves the latest events from the database with support for pagination.
 *
 * @function
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 *
 * @returns {void}
 */
export const getEventByID: RequestHandler = async (req, res, next) => {
  try {
    const eventID = schemma.schemmaEventIdParams.safeParse(req.params);

    if (!eventID.success) {
      return res.status(400).json({ error: 'validation error', issues: eventID['error']?.issues });
    }

    const likedEvent =
      await prisma.event
        .findUnique({
          where: {
            id: eventID.data.id
          },
          include: { location: true, photos: { take: 1, where: { order: 0 } } }
        });

    if (!likedEvent) {
      res.status(404).json({ error: 'not found' });
    }

    res.status(200).json(likedEvent);
  }
  catch (error) {
    next(error);
  }
};


/**
 * Get all users who have liked event by eventId.
 *
 * This function retrieves the latest events from the database with support for pagination.
 *
 * @function
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 *
 * @returns {void}
 */
export const getAllUsersWhoLikedSameEventWithPagination: RequestHandler = async (req, res, next) => {
  try {
    const eventID = schemma.schemmaEventIdParams.safeParse(req.params);
    const reqQueryParams = schemma.schemmaEventQueriesWithPagination.safeParse(req.query);

    // handles validation
    if (!reqQueryParams.success) {
      return res.status(400).json({ error: 'Validation failed', issues: reqQueryParams['error'].issues });
    }
    if (!eventID.success) {
      return res.status(400).json({ error: 'Validation failed', issues: eventID['error'].issues });
    }

    const { limit, cursor } = reqQueryParams.data;

    // EventLike model
    const whereCondition: Prisma.EventLikeWhereInput = {
      eventId: eventID.data.id, // all the likes for this event
      userId: {
        // gives all the users who liked the current event, excluding the current user
        not: req.user.id
      },
      user: {
        // excludes the current user's friendships
        NOT: {
          OR: [
            {
              outgoingFriendships: { some: { receiverId: req.user.id, status: 'ACCEPTED' } },
            },
            {
              incomingFriendships: { some: { senderId: req.user.id, status: 'ACCEPTED' } },
            }
          ]
        },
      }
    };

    const query: Prisma.EventLikeFindManyArgs = {
      ...configCursor(limit, cursor),
      where: whereCondition,
      include: {
        user: {
          include: {
            photos: { take: 1, where: { order: 0 } },
            // HANDLE FROM THE FRONT-END

            // if status === 'PENDING', show either 'pending' button
            // or show macth modal.

            // if both are zero and are neither 'ACCEPTEP' or 'PENDING'
            // show the 'JOIN' button.
            outgoingFriendships: {                 // this can be one or zero
              where: { receiverId: req.user.id },
              // if there is one element here it means that you have sent a
              // friendship inviation to this person, SO SHOW THE "PENDING" button
            },

            incomingFriendships: {                // this can be one or zero
              // since friendship are unique, here I will know if I have
              // a pending invitatopm

              where: { senderId: req.user.id }
              // if there is the frienship invitation then you can make
              // instant MATCH on CLICK
              // else if its empty, you can send yourself the inviation
              //  and then the button changes to "PENDING".
            }
          }
        }
      }
    };

    // gets all the likes given to an event
    const [totalusersCount, usersWhoLikedEventList] = (
      await
        Promise.all([
          prisma.eventLike.count({ where: whereCondition }),
          prisma.eventLike.findMany(query)
        ])
    );

    const usersList =
      usersWhoLikedEventList.map(likedEvent => ({
        ...likedEvent,
        user: {
          ...likedEvent['user'],
          hasIncommingFriendship: likedEvent['user']['incomingFriendships']?.at(0)?.status === 'PENDING',
          hasOutgoingFriendship: likedEvent['user']['outgoingFriendships']?.at(0)?.status === 'PENDING'
        }
      }));
    // since we are counting down from the latest items in the table,
    // when we reach the first item, we should stop looking for the next cursor.
    const nextCursor = usersList.at(-1)?.id === 1 ? null : usersList.at(-1)?.id ?? null;

    res
      .status(200)
      .json({
        usersWhoLikedEvent: cursor > 0 ? usersList.slice(1) : usersList,
        nextCursor,
        totalUsers: totalusersCount,
        hasNextCursor: nextCursor !== null || usersList.length < limit,
        usersPerPage: limit,
      });
  }
  catch (error) {
    next(error);
  }
};


/**
 * Get matched(liked) events between two users.
 *
 * This function retrieves the latest events from the database with support for pagination.
 *
 * @function
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 *
 * @returns {void}
 */
export const getMatchedEventsByTwoUsersWithPagination: RequestHandler = async (req, res, next) => {
  try {
    const urlParam = schemma.schemmaEventIdParams.safeParse(req.params);
    const reqQueryParams = schemma.schemmaEventQueriesWithPagination.safeParse(req.query);

    if (!urlParam.success) {
      return res.status(400).json({ error: 'Validation error', issues: urlParam['error']?.issues });
    }
    if (!reqQueryParams.success) {
      return res.status(400).json({ error: 'Validation error', issues: reqQueryParams['error']?.issues });
    }
    // if the auth user is reading another's user profile true, otherwise false
    const meetNewPeopleProfile = await prisma.user.findUnique({ where: { uid: urlParam.data.uid } });
    if (!meetNewPeopleProfile) {
      return res.status(404).json({ error: 'user not found' });
    }

    const { limit, cursor, allPhotos } = reqQueryParams.data;

    const whereCondition = {
      // gets all events where two different users share the same likes
      userId: meetNewPeopleProfile.id,
      event: { likes: { some: { userId: req.user.id } } },
    };

    const canGetMacthes: boolean = (req.user.id !== meetNewPeopleProfile.id);
    let latestLikedEvents: ILikeableEvent[];
    let totalEventsCount: number;

    if (canGetMacthes) {
      if (allPhotos) {
        const [matchedEvents, eventsCount] = await Promise.all([

          prisma.eventLike.findMany({
            ...configCursor(limit, cursor),
            where: whereCondition,
            select: {
              event: {
                include: {
                  location: true,
                  photos: true,
                  _count: {
                    select: {
                      likes: true,
                      shares: true
                    }
                  }
                },
              }
            },
          }),

          prisma.eventLike.count({ where: whereCondition }),
        ]);

        latestLikedEvents = matchedEvents.map(({ event }) => {
          return {
            ...event,
            isLiked: true, // because we are getting only the liked events
          };
        });
        totalEventsCount = eventsCount;
      }
      else {
        const [eventsWithAllPhotos, eventsCount] = await Promise.all([

          prisma.eventLike.findMany({
            ...configCursor(limit, cursor),
            where: whereCondition,
            select: {
              event: {
                include: {
                  photos: { take: 1, where: { order: 0 } },
                },
              }
            },
          }),

          prisma.eventLike.count({ where: whereCondition }),
        ]);

        latestLikedEvents = eventsWithAllPhotos.map(({ event }) => {
          return {
            ...event,
            isLiked: true, // because we are getting only the liked events
          };
        });
        totalEventsCount = eventsCount;
      }

      const nextCursor = latestLikedEvents.at(-1)?.id === 1 ? null : latestLikedEvents.at(-1)?.id ?? null;

      return res
        .status(200)
        .json({
          events: cursor > 0 ? latestLikedEvents.slice(1) : latestLikedEvents,
          totalEvents: totalEventsCount,
          nextCursor,
          eventsPerPage: limit,
        });
    }

    return res.status(200).json({});
  }
  catch (error) {
    next(error);
  }
};


/**
 * Create or Delete a like for a given event record
 *
 * This function handles the creation of a new event, including data validation and database insertion using Prisma.
 *
 * @function
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
export const createOrDeleteLikeByEventId: RequestHandler = async (req, res, next) => {
  try {
    // Try to parse the event ID from the request parameters
    const event = schemma.schemmaEventIdParams.safeParse(req.params);

    // Check if the parsing was successful
    if (!event.success) {
      // If parsing fails, respond with a validation error
      return res.status(400).json({ error: 'validation error' });
    }
    // Check if a like for this event by the current user already exists
    const likeExist = await prisma.eventLike.findUnique({
      where: {
        eventId_userId: { eventId: event.data.id, userId: req.user.id }
      },
    });
    // If a like already exists
    if (likeExist) {
      // Delete the existing like record
      await prisma.eventLike.delete({
        where: {
          id: likeExist.id
        }
      });

      // Respond with a successful deletion status
      res.status(204).end(null);
    }
    else {
      // If the like doesn't exist, create a new like record
      const eventLiked = await prisma.eventLike.create({
        data: {
          eventId: event.data.id,
          userId: req.user.id
        }
      });

      // Respond with a successful creation status and the newly created like record
      res.status(201).json({ eventLiked });
    }
  }
  catch (error) {
    // If any error occurs during the execution, pass it to the error handling middleware
    next(error);
  }
};
