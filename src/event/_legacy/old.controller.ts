// import { PrismaService } from '../../config/dataBase';
// import { RequestHandler } from 'express';
// import { idsSchemma } from '../../shared/dto/baseDTOs';
// import Container from 'typedi';
// // import * as schemma from '../event.dto';
// // import { Event } from '@prisma/client';
// // import { configCursorBasedPagination } from '../../helpers/configCursor';

// const prismaService = Container.get(PrismaService);
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
// export const getAllLatestEventsWithPagination: RequestHandler = async (req, res, next) => {
//   try {
//     // parsing queryParams
//     const reqQueryParams = schemma.getTargetUserEventsSchemma.safeParse(req.query);

//     // handles validation
//     if (!reqQueryParams.success) {
//       return res.status(400).json({ error: 'Validation failed', issues: reqQueryParams['error'].issues });
//     }
//     const { limit, cursor, categories } = reqQueryParams.data;

//     const query: Prisma.EventFindManyArgs = {
//       ...configCursor(limit, cursor),
//       where: categories?.length > 0 ? { categories: { hasSome: categories } } : undefined,
//       include: {
//         // counts all the likes for a given event
//         _count: {
//           select: {
//             likes: true,
//             shares: true
//           }
//         },
//         likes: {
//           // 1 or 0 times if the user has liked the event
//           where: { userId: req.user.id },
//         },
//         // organization: true,
//         location: true,
//         photos: true
//       }
//     };

//     // concurrent database query
//     const [totalEventsCount, latestEvents] = (
//       await
//         Promise.all([
//           prisma.event.count({ where: categories?.length > 0 ? { categories: { hasSome: categories } } : undefined }),  // counting all records in the entire table
//           prisma.event.findMany(query),
//         ])
//     );

//     const latestLikabledEvents: ILikeableEvent[] = latestEvents.map(event => {
//       return {
//         ...event,
//         // if the users'ID appears once in the likes array, then true otherwise false
//         isLiked: event['likes'].length === 1 && event['likes'][0]?.userId === req.user.id,
//       };
//     });

//     // since we are counting down from the latest items in the table,
//     // when we reach the first item, we should stop looking for the next cursor.
//     const nextCursor = latestLikabledEvents.at(-1)?.id ?? null;
//     res
//       .status(200)
//       .json({
//         items: cursor > 0 ? latestLikabledEvents.slice(1) : latestLikabledEvents,
//         totalItems: totalEventsCount,
//         nextCursor,
//         hasNextCursor: latestLikabledEvents.length === limit,
//         itemsPerPage: limit,
//       });
//   }
//   catch (error) {
//     next(error);
//   }
// };


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
// export const getLikedEventsForBucketListWithPagination: RequestHandler = async (req, res, next) => {
//   try {
//     // parsing queryParams
//     const reqQueryParams = schemma.getTargetUserEventsSchemma.safeParse(req.query);

//     // handles validation
//     if (!reqQueryParams.success) {
//       return res.status(400).json({ error: 'Validation failed', issues: reqQueryParams['error'].issues });
//     }
//     const { limit, cursor, userId: secondUserID } = reqQueryParams.data;
//     const lookForSecondUserById = req.user?.id && secondUserID ? true : false;
//     const userIdToLookFor = lookForSecondUserById ? secondUserID : req.user?.id;
//     const whereCondition = { userId: userIdToLookFor };

//     let latestLikedEvents: ILikeableEvent[];
//     let totalEventsCount: number;

//     if (lookForSecondUserById) {
//       const [eventsWithAllPhotos, eventsCount] = await Promise.all([

//         prisma.eventLike.findMany({
//           ...configCursor(limit, cursor),
//           where: whereCondition,
//           select: {
//             event: {
//               include: {
//                 location: true,
//                 likes: { where: { userId: req.user.id } },
//                 photos: true,
//                 _count: {
//                   select: {
//                     likes: true,
//                     shares: true
//                   }
//                 }
//               },
//             }
//           },
//         }),

//         prisma.eventLike.count({ where: whereCondition }),
//       ]);

//       latestLikedEvents = eventsWithAllPhotos.map(({ event }) => {
//         return {
//           ...event,
//           isLiked: event.likes?.length === 1, // because we are getting only the liked events
//         };
//       });
//       totalEventsCount = eventsCount;
//     }
//     else {
//       const [eventsWithAllPhotos, eventsCount] = await Promise.all([

//         prisma.eventLike.findMany({
//           orderBy: { id: 'desc' },
//           take: cursor > 0 ? limit + 1 : limit, // only adds 1 when limit is greater than 0
//           cursor: cursor > 0 ? { id: cursor } : undefined, // makes pagination
//           where: whereCondition,
//           select: {
//             event: {
//               include: {
//                 photos: { take: 1, where: { order: 0 } },
//                 likes: {
//                   take: 3,
//                   where: {
//                     // get all the users's likes except the authenticated user's
//                     NOT: whereCondition
//                   },
//                   select: {
//                     user: {
//                       select: { photos: { take: 1, where: { order: 0 } } }
//                     }
//                   }
//                 }
//               },
//             }
//           },
//         }),

//         prisma.eventLike.count({ where: whereCondition }),
//       ]);

//       latestLikedEvents = eventsWithAllPhotos.map(({ event }) => {
//         return {
//           ...event,
//           isLiked: true, // because we are getting only the liked events by a same user
//         };
//       });
//       totalEventsCount = eventsCount;
//     }
//     // since we are counting down from the latest items in the table,
//     // when we reach the first item, we should stop looking for the next cursor.
//     const nextCursor = latestLikedEvents.at(-1)?.id ?? null;
//     res
//       .status(200)
//       .json({
//         items: cursor > 0 ? latestLikedEvents.slice(1) : latestLikedEvents,
//         totalItems: totalEventsCount,
//         nextCursor,
//         hasNextCursor: latestLikedEvents.length === limit,
//         itemsPerPage: limit,
//       });
//   }
//   catch (error) {
//     next(error);
//   }
// };


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
// export const getEventByID: RequestHandler = async (req, res, next) => {
//   try {
//     const eventID = idsSchemma.safeParse(req.params);

//     if (!eventID.success) {
//       return res.status(400).json({ error: 'validation error', issues: eventID['error']?.issues });
//     }

//     const likedEvent =
//       await prisma.event
//         .findUnique({
//           where: {
//             id: eventID.data.id
//           },
//           include: { location: true, photos: { take: 1, where: { order: 0 } } }
//         });

//     if (!likedEvent) {
//       res.status(404).json({ error: 'not found' });
//     }

//     res.status(200).json(likedEvent);
//   }
//   catch (error) {
//     next(error);
//   }
// };


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
// export const getAllUsersWhoLikedSameEventWithPagination: RequestHandler = async (req, res, next) => {
//   try {
//     const eventID = idsSchemma.safeParse(req.params);
//     const reqQueryParams = schemma.getTargetUserEventsSchemma.safeParse(req.query);

//     // handles validation
//     if (!reqQueryParams.success) {
//       return res.status(400).json({ error: 'Validation failed', issues: reqQueryParams['error'].issues });
//     }
//     if (!eventID.success) {
//       return res.status(400).json({ error: 'Validation failed', issues: eventID['error'].issues });
//     }

//     const { limit, cursor } = reqQueryParams.data;

//     // EventLike model
//     const whereCondition: Prisma.EventLikeWhereInput = {
//       eventId: eventID.data.id, // all the likes for this event
//       userId: {
//         // gives all the users who liked the current event, excluding the current user
//         not: req.user.id
//       },
//       user: {
//         // excludes the current user's friendships
//         NOT: {
//           OR: [
//             {
//               outgoingFriendships: { some: { receiverId: req.user.id, status: 'ACCEPTED' } },
//             },
//             {
//               incomingFriendships: { some: { senderId: req.user.id, status: 'ACCEPTED' } },
//             }
//           ]
//         },
//       }
//     };

//     const query: Prisma.EventLikeFindManyArgs = {
//       ...configCursor(limit, cursor),
//       where: whereCondition,
//       include: {
//         user: {
//           include: {
//             photos: { take: 1, where: { order: 0 } },
//             // HANDLE FROM THE FRONT-END

//             // if status === 'PENDING', show either 'pending' button
//             // or show macth modal.

//             // if both are zero and are neither 'ACCEPTEP' or 'PENDING'
//             // show the 'JOIN' button.
//             outgoingFriendships: {                 // this can be one or zero
//               where: { receiverId: req.user.id },
//               // if there is one element here it means that you have sent a
//               // friendship inviation to this person, SO SHOW THE "PENDING" button
//             },

//             incomingFriendships: {                // this can be one or zero
//               // since friendship are unique, here I will know if I have
//               // a pending invitatopm

//               where: { senderId: req.user.id }
//               // if there is the frienship invitation then you can make
//               // instant MATCH on CLICK
//               // else if its empty, you can send yourself the inviation
//               //  and then the button changes to "PENDING".
//             }
//           }
//         }
//       }
//     };

//     // gets all the likes given to an event
//     const [totalusersCount, usersWhoLikedEventList] = (
//       await
//         Promise.all([
//           prisma.eventLike.count({ where: whereCondition }),
//           prisma.eventLike.findMany(query)
//         ])
//     );

//     const usersList =
//       usersWhoLikedEventList.map(likedEvent => ({
//         ...likedEvent,
//         user: {
//           ...likedEvent['user'],
//           hasIncommingFriendship: likedEvent['user']['incomingFriendships']?.at(0)?.status === 'PENDING',
//           hasOutgoingFriendship: likedEvent['user']['outgoingFriendships']?.at(0)?.status === 'PENDING'
//         }
//       }));
//     // since we are counting down from the latest items in the table,
//     // when we reach the first item, we should stop looking for the next cursor.
//     const nextCursor = usersList.at(-1)?.id ?? null;

//     res
//       .status(200)
//       .json({
//         items: cursor > 0 ? usersList.slice(1) : usersList,
//         nextCursor,
//         totalItems: totalusersCount,
//         hasNextCursor: usersList.length === limit,
//         itemsPerPage: limit,
//       });
//   }
//   catch (error) {
//     next(error);
//   }
// };


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
// export const getMatchedEventsByTwoUsersWithPagination: RequestHandler = async (req, res, next) => {
//   try {
//     const urlParam = idsSchemma.safeParse(req.params);
//     const reqQueryParams = schemma.getTargetUserEventsSchemma.safeParse(req.query);

//     if (!urlParam.success) {
//       return res.status(400).json({ error: 'Validation error', issues: urlParam['error']?.issues });
//     }
//     if (!reqQueryParams.success) {
//       return res.status(400).json({ error: 'Validation error', issues: reqQueryParams['error']?.issues });
//     }
//     // if the auth user is reading another's user profile true, otherwise false
//     const meetNewPeopleProfile = await prisma.user.findUnique({ where: { uid: urlParam.data.uid } });
//     if (!meetNewPeopleProfile) {
//       return res.status(404).json({ error: 'user not found' });
//     }

//     const { limit, cursor, allPhotos } = reqQueryParams.data;

//     const whereCondition = {
//       // gets all events where two different users share the same likes
//       userId: meetNewPeopleProfile.id,
//       event: { likes: { some: { userId: req.user.id } } },
//     };

//     const canGetMacthes: boolean = (req.user.id !== meetNewPeopleProfile.id);
//     let latestLikedEvents: ILikeableEvent[];
//     let totalEventsCount: number;

//     if (canGetMacthes) {
//       if (allPhotos) {
//         const [matchedEvents, eventsCount] = await Promise.all([

//           prisma.eventLike.findMany({
//             ...configCursorBasedPagination(limit, cursor),
//             where: whereCondition,
//             select: {
//               event: {
//                 include: {
//                   location: true,
//                   photos: true,
//                   _count: {
//                     select: {
//                       likes: true,
//                       shares: true
//                     }
//                   }
//                 },
//               }
//             },
//           }),

//           prisma.eventLike.count({ where: whereCondition }),
//         ]);

//         latestLikedEvents = matchedEvents.map(({ event }) => {
//           return {
//             ...event,
//             isLiked: true, // because we are getting only the liked events
//           };
//         });
//         totalEventsCount = eventsCount;
//       }
//       else {
//         const [eventsWithAllPhotos, eventsCount] = await Promise.all([

//           prisma.eventLike.findMany({
//             ...configCursorBasedPagination(limit, cursor),
//             where: whereCondition,
//             select: {
//               event: {
//                 include: {
//                   photos: { take: 1, where: { order: 0 } },
//                 },
//               }
//             },
//           }),

//           prisma.eventLike.count({ where: whereCondition }),
//         ]);

//         latestLikedEvents = eventsWithAllPhotos.map(({ event }) => {
//           return {
//             ...event,
//             isLiked: true, // because we are getting only the liked events
//           };
//         });
//         totalEventsCount = eventsCount;
//       }

//       const nextCursor = latestLikedEvents.at(-1)?.id ?? null;

//       return res
//         .status(200)
//         .json({
//           items: cursor > 0 ? latestLikedEvents.slice(1) : latestLikedEvents,
//           totalItems: totalEventsCount,
//           nextCursor,
//           hasNextCursor: latestLikedEvents.length === limit,
//           itemsPerPage: limit,
//         });
//     }

//     return res.status(200).json({});
//   }
//   catch (error) {
//     next(error);
//   }
// };
