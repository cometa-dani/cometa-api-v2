import { EventLike, EventPhoto, Prisma, Event } from '@prisma/client';
import { Service, Container } from 'typedi';
import { PrismaService } from '../config/dataBase';
import { configCursor } from '../helpers/configCursor';
import { GetAllEventsDTO, SearchEventByNameDto, SearchEventsDTO } from './event.dto';
import { CloudStorageService } from '../shared/cloudStorage/cloud-storage.service';
import { HttpError } from 'src/helpers/httpError';


interface ILikeableEvent extends Event {
  isLiked: boolean;
}

@Service()
export class EventService {
  private _prismaService = Container.get(PrismaService);
  private _cloudStorageService = Container.get(CloudStorageService);

  public async getUsersWhoLikedSameEvent(
    eventID: number, loggedInUserID: number, { limit, cursor }: GetAllEventsDTO
  )
    : Promise<[number, EventLike[]]> {
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

    const usersList =
      usersWhoLikedEventList.map(likedEvent => ({
        ...likedEvent,
        user: {
          ...likedEvent['user'],
          hasIncommingFriendship: likedEvent['user']['incomingFriendships']?.at(0)?.status === 'PENDING',
          hasOutgoingFriendship: likedEvent['user']['outgoingFriendships']?.at(0)?.status === 'PENDING'
        }
      }));

    return [totalusersCount, usersList];
  }

  public async searchLatestPaginatedEvents(
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
      ...configCursor(limit, cursor),
      // orderBy: { createdAt: 'desc' },
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

  public async searchPaginatedEventsByName(searchDto: SearchEventByNameDto) {
    return (
      Promise.all([
        this._prismaService.event
          .findMany({
            ...configCursor(searchDto.limit, searchDto.cursor),
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

  public async getLikedEvents(
    loggedInUserID: number, limit: number, cursor: number, targetUserID?: number
  )
    : Promise<[ILikeableEvent[], number]> {
    const lookForSecondUserById = loggedInUserID && targetUserID ? true : false;
    const userIdToLookFor = lookForSecondUserById ? targetUserID : loggedInUserID;
    const whereCondition = { userId: userIdToLookFor };

    let latestLikedEvents: ILikeableEvent[];
    let totalEventsCount: number;

    if (lookForSecondUserById) {
      const [eventsWithAllPhotos, eventsCount] = await Promise.all([
        this._prismaService.eventLike.findMany({
          ...configCursor(limit, cursor),
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

  public async createEvent() {
    //
  }

  public async updateEvent() {
    //
  }

  public async uploadEventPhotos(incommingImgFiles: Express.Multer.File[], eventID: number, startCount: number) {
    try {
      const eventPhotos = (
        await this._cloudStorageService.uploadManyPhotosToBucket(`events/${eventID}`, incommingImgFiles, startCount)
      );
      return this._prismaService.event.update({
        where: { id: eventID },
        data: {
          photos: {
            createMany: {
              data: eventPhotos
            }
          }
        },
        include: {
          photos: true
        }
      });
    } catch (error) {
      throw new HttpError(500, 'Uploading event photos failed' + error.message);
    }
  }

  public async deleteEvent() {
    //
  }

  public async deletePhoto(userId: number, photoToDelete: EventPhoto) {
    const destinationPath = `users/${userId}/photos/${photoToDelete.order}`;
    await this._cloudStorageService.deletePhotoFromBucket(destinationPath);
    await this._prismaService.eventPhoto.delete({ where: { id: photoToDelete.id } });
    return (
      this._prismaService.eventPhoto.updateMany({
        where: {
          eventId: photoToDelete.eventId,
          order: { gte: photoToDelete.order } // reorders the remaining photos
        },
        data: {
          order: { decrement: 1 }  // reorders the remaining photos
        }
      })
    );
  }
}
