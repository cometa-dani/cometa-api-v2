import { Prisma, Event } from '@prisma/client';
import { Service, Container } from 'typedi';
import { PrismaService } from '../../config/dataBase';
import { configCursorBasedPagination } from '../../helpers/configCursor';
import { GetTargetUserEventsDTO, ILikeableEvent, ILikedEvent, SearchEventsDTO } from './event.dto';
import { HttpError } from '../../helpers/httpError';
import { ErrorMessage } from '../../helpers/errorMessages';


@Service()
export class EventService {
  private _prismaService = Container.get(PrismaService);

  public async getPaginatedMatchedEventsByTwoUsers(
    loggedInUserID: number, targetUserId: string, queryParams: GetTargetUserEventsDTO
  )
    : Promise<[ILikeableEvent[], number]> {
    const targetUser = await this._prismaService.user.findUnique({ where: { uid: targetUserId } });
    const { limit, cursor, allPhotos } = queryParams;
    const whereCondition = {
      // gets all events where two different users share the same likes
      userId: targetUser.id,
      event: { likes: { some: { userId: loggedInUserID } } },
    };
    const areDifferentUsers: boolean = (loggedInUserID !== targetUser.id);
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
    throw new HttpError(404, ErrorMessage.NOT_FOUND);
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


  public async searchPaginatedEventsByName(searchDto: SearchEventsDTO): Promise<[Event[], number]> {
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
    : Promise<[ILikedEvent[], number]> {
    const { limit, cursor, userId: targetUserID } = queryParams;
    const hasTargetUser = loggedInUserID && targetUserID ? true : false;
    const userIdToLookFor = hasTargetUser ? targetUserID : loggedInUserID;
    const whereCondition = { userId: userIdToLookFor };
    let latestLikedEvents: ILikedEvent[];
    let totalEventsCount: number;

    if (hasTargetUser) {
      const [eventsWithAllPhotos, eventsCount] = await Promise.all([
        this._prismaService.eventLike.findMany({
          ...configCursorBasedPagination(limit, cursor), // TODO: Pienso que el cursor deberia ser por event_id no por id
          where: whereCondition,
          select: {
            id: true,
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
      latestLikedEvents = eventsWithAllPhotos.map(({ event, id }) => {
        return {
          id,
          event,
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
            id: true,
            event: {
              include: {
                location: true,
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
      latestLikedEvents = eventsWithAllPhotos.map(({ event, id }) => {
        return {
          id,
          event,
          isLiked: true
        };
      });
      totalEventsCount = eventsCount;
    }
    return [latestLikedEvents, totalEventsCount];
  }
}
