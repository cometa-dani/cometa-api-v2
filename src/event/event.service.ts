import { EventLike, EventPhoto, Prisma, Event } from '@prisma/client';
import { Service, Container } from 'typedi';
import { prisma } from '../dataBaseConnection';
import { configCursor } from '../helpers/configCursor';
import { EventsByQueryParamsDTO, SearchByNameDto, SearchEventsByQueryParamsDTO } from './event.dto';
import { ImageStorageService } from '../shared/imageStorage/image-storage.service';


interface ILikeableEvent extends Event {
  isLiked: boolean;
}

@Service()
export class EventService {

  private _prisma = prisma;
  private _imageStorageService = Container.get(ImageStorageService);


  async getUsersWhoLikedSameEvent(eventID: number, loggedInUserID: number, { limit, cursor }: EventsByQueryParamsDTO): Promise<[number, EventLike[]]> {
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
          this._prisma.eventLike.count({ where: whereCondition }),
          this._prisma.eventLike.findMany(query)
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


  async searchLatestEventsWithPagination({ categories, cursor, limit, name = '' }: SearchEventsByQueryParamsDTO, userID: number): Promise<[ILikeableEvent[], number]> {
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
          prisma.event.count({ where }),  // counting all records in the entire table
          prisma.event.findMany(query),
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


  async searchEventsByName(searchDto: SearchByNameDto) {
    return (
      Promise.all([
        this._prisma.event
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
        this._prisma.event
          .count({
            where: {
              name: { contains: searchDto.name, mode: 'insensitive' }
            }
          })
      ])
    );
  }


  async uploadPhotos(incommingImgFiles: Express.Multer.File[], userId: number): Promise<string[]> {
    const filesToUpload =
      incommingImgFiles.map((file) => {
        const destinationPath = `events/${userId}/photos/${file.filename}`;
        return this._imageStorageService.uploadPhotos(destinationPath, file);
      });

    return Promise.all(filesToUpload);
  }


  async generatePhotoHashes(incommingImgFiles: Express.Multer.File[]): Promise<string[]> {
    const filesToHash =
      incommingImgFiles.map((file) => {
        return this._imageStorageService.generatePhotoHashes(file.buffer);
      });

    return Promise.all(filesToHash);
  }


  async deletePhoto(userId: number, photoToDelete: EventPhoto) {
    const destinationPath = `users/${userId}/photos/${photoToDelete.order}`;
    await this._imageStorageService.deletePhoto(destinationPath);
    await this._prisma.eventPhoto.delete({ where: { id: photoToDelete.id } });

    return this._prisma.eventPhoto.updateMany({
      where: {
        eventId: photoToDelete.eventId,
        order: { gte: photoToDelete.order } // reorders the remaining photos
      },
      data: {
        order: { decrement: 1 }  // reorders the remaining photos
      }
    });
  }
}
