import { Prisma, Event } from '@prisma/client';
import { Service, Container } from 'typedi';
import { PrismaService } from '../config/dataBase';
import { configCursorBasedPagination } from '../helpers/configCursor';
import { CreateEventDto, GetTargetUserEventsDTO, ILikeableEvent, IUsersLikedSameEvent, SearchEventsDTO, UpdateEventDto } from './event.dto';
import { HttpError } from '../helpers/httpError';
import { ErrorMessage } from '../helpers/errorMessages';


@Service()
export class EventService {
  private _prismaService = Container.get(PrismaService);


  // TODO: remove in the future into the users folder
  public async getUsersWhoLikedSameEvent(
    eventID: number, loggedInUserID: number, { limit, cursor }: GetTargetUserEventsDTO
  )
    : Promise<[IUsersLikedSameEvent[], number]> {
    // EventLike model
    const whereCondition: Prisma.EventLikeWhereInput = {
      eventId: eventID, // all the likes for this event
      userId: {
        // gives all the users who liked the current event, excluding the current user
        not: loggedInUserID
      },
      user: {
        // excludes the current user's friendships
        NOT: {
          OR: [
            {
              outgoingFriendships: { some: { receiverId: loggedInUserID, status: 'ACCEPTED' } },
            },
            {
              incomingFriendships: { some: { senderId: loggedInUserID, status: 'ACCEPTED' } },
            }
          ]
        },
      }
    };
    const query: Prisma.EventLikeFindManyArgs = {
      ...configCursorBasedPagination(limit, cursor),
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
              where: { receiverId: loggedInUserID },
              // if there is one element here it means that you have sent a
              // friendship inviation to this person, SO SHOW THE "PENDING" button
            },

            incomingFriendships: {                // this can be one or zero
              // since friendship are unique, here I will know if I have
              // a pending invitatopm

              where: { senderId: loggedInUserID }
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
    const [totalusersCount = 0, usersWhoLikedEventList = []] = (
      await
        Promise.all([
          this._prismaService.eventLike.count({ where: whereCondition }),
          this._prismaService.eventLike.findMany(query)
        ])
    );
    const usersList: IUsersLikedSameEvent[] =
      usersWhoLikedEventList.map(likedEvent => ({
        ...likedEvent,
        user: {
          ...likedEvent['user'],
          hasIncommingFriendship: likedEvent['user']['incomingFriendships']?.at(0)?.status === 'PENDING',
          hasOutgoingFriendship: likedEvent['user']['outgoingFriendships']?.at(0)?.status === 'PENDING'
        }
      }));

    return [usersList, totalusersCount];
  }


  public async getPaginatedMatchedEventsByTwoUsers(
    loggedInUserID: number, targetUserId: number, queryParams: GetTargetUserEventsDTO
  ): Promise<[ILikeableEvent[], number]> {
    const { limit, cursor, allPhotos } = queryParams;
    const whereCondition = {
      // gets all events where two different users share the same likes
      userId: targetUserId,
      event: { likes: { some: { userId: loggedInUserID } } },
    };
    const areDifferentUsers: boolean = (loggedInUserID !== targetUserId);
    let latestLikedEvents: ILikeableEvent[];
    let totalEventsCount: number;
    if (areDifferentUsers) {
      if (allPhotos) {
        const [matchedEvents, eventsCount] = await Promise.all([
          this._prismaService.eventLike.findMany({
            ...configCursorBasedPagination(limit, cursor),
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

          this._prismaService.eventLike.count({ where: whereCondition }),
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
          this._prismaService.eventLike.findMany({
            ...configCursorBasedPagination(limit, cursor),
            where: whereCondition,
            select: {
              event: {
                include: {
                  photos: { take: 1, where: { order: 0 } },
                },
              }
            },
          }),

          this._prismaService.eventLike.count({ where: whereCondition }),
        ]);

        latestLikedEvents = eventsWithAllPhotos.map(({ event }) => {
          return {
            ...event,
            isLiked: true, // because we are getting only the liked events
          };
        });
        totalEventsCount = eventsCount;
      }
      return [latestLikedEvents, totalEventsCount];
    }
    throw new HttpError(404, ErrorMessage.USER_NOT_FOUND);
  }


  public async getPaginatedLatestEvents(
    { categories, cursor, limit, name = '' }: SearchEventsDTO, userID: number
  )
    : Promise<[ILikeableEvent[], number]> {
    const whereCategoriesAndName: Prisma.EventWhereInput = {
      AND: [
        { categories: { hasSome: categories } },
        { name: { contains: name, mode: 'insensitive' } }
      ]
    };
    const whereOnlyName: Prisma.EventWhereInput = {
      name: { contains: name, mode: 'insensitive' }
    };
    const where = categories ? whereCategoriesAndName : whereOnlyName;
    const query: Prisma.EventFindManyArgs = {
      ...configCursorBasedPagination(limit, cursor),
      where: where,
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
          where: { userId: userID },
        },
        // organization: true,
        location: true,
        photos: true
      }
    };
    const [totalEventsCount, latestEvents] = (
      await
        Promise.all([
          this._prismaService.event.count({ where }),  // counting all records in the entire table
          this._prismaService.event.findMany(query),
        ])
    );
    const latestLikabledEvents: ILikeableEvent[] = latestEvents.map(event => {
      return {
        ...event,
        // if the users'ID appears once in the likes array, then true otherwise false
        isLiked: event['likes'].length === 1 && event['likes'][0]?.userId === userID,
      };
    }) ?? [];
    return [latestLikabledEvents, totalEventsCount];
  }


  public async searchPaginatedEventsByName(searchDto: SearchEventsDTO) {
    return (
      Promise.all([
        this._prismaService.event
          .findMany({
            ...configCursorBasedPagination(searchDto.limit, searchDto.cursor),
            where: {
              name: {
                contains: searchDto.name,
                mode: 'insensitive',
              }
            },
            include: {
              photos: { where: { order: 0 }, take: 1 },
            }
          }),
        this._prismaService.event
          .count({
            where: {
              name: { contains: searchDto.name, mode: 'insensitive' }
            }
          })
      ])
    );
  }


  public async getEventById(eventId: number) {
    return (
      this._prismaService.event
        .findUnique({
          where: { id: eventId },
          include: { location: true, photos: { take: 1, where: { order: 0 } } }
        })
    );
  }


  // TODO: remove in the future into the likes folder
  public async getPaginatedLikedEvents(
    loggedInUserID: number, queryParams: GetTargetUserEventsDTO
  )
    : Promise<[ILikeableEvent[], number]> {
    const { limit, cursor, userId: targetUserID } = queryParams;
    const lookForSecondUserById = loggedInUserID && targetUserID ? true : false;
    const userIdToLookFor = lookForSecondUserById ? targetUserID : loggedInUserID;
    const whereCondition = { userId: userIdToLookFor };

    let latestLikedEvents: ILikeableEvent[];
    let totalEventsCount: number;

    if (lookForSecondUserById) {
      const [eventsWithAllPhotos, eventsCount] = await Promise.all([
        this._prismaService.eventLike.findMany({
          ...configCursorBasedPagination(limit, cursor),
          where: whereCondition,
          select: {
            event: {
              include: {
                location: true,
                likes: { where: { userId: loggedInUserID } },
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
        this._prismaService.eventLike.count({ where: whereCondition }),
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
        this._prismaService.eventLike.findMany({
          ...configCursorBasedPagination(limit, cursor),
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
        this._prismaService.eventLike.count({ where: whereCondition }),
      ]);
      latestLikedEvents = eventsWithAllPhotos.map(({ event }) => {
        return {
          ...event,
          isLiked: true, // because we are getting only the liked events by a same user
        };
      });
      totalEventsCount = eventsCount;
    }
    return [latestLikedEvents, totalEventsCount];
  }


  public async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    return this._prismaService.event.create({
      data: {
        name: createEventDto.name,
        categories: createEventDto.categories,
        description: createEventDto.description,
        date: createEventDto.date,
        locationId: createEventDto.locationId,
        organizationId: createEventDto.organizationId
      }
    });
  }


  public async updateEvent(eventId: number, updateEventDto: UpdateEventDto): Promise<Event> {
    return this._prismaService.event.update({
      where: { id: eventId },
      data: updateEventDto
    });
  }


  public async deleteEvent(eventId: number): Promise<Event> {
    return this._prismaService.event.delete({ where: { id: eventId } });
  }
}
