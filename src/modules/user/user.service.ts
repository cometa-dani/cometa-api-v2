import { Service, Container } from 'typedi';
import { SearchByQueryParamsDTO, CreateUserDTO, SearchByUsernameDTO, UpdateUserDTO, IUsersLikedSameEvent, GetTargetUserEventsDTO } from './user.dto';
import { StorageService } from '../shared/cloudStorage/cloud-storage.service';
import { UserPhoto, User, Friendship, Prisma } from '@prisma/client';
import { PrismaService } from '../../config/dataBase';
import { configCursorBasedPagination } from '../../helpers/configCursor';
import { HttpError } from '../../helpers/httpError';
import { IUploadedPhoto } from '../shared/cloudStorage/interfaces';
import { maxNumPhotosPerUser } from '../../vars';


@Service()
export class UserService {
  private _prismaService = Container.get(PrismaService);
  private _storageService = Container.get(StorageService);

  private _areFriends(
    user: {
      incomingFriendships: Friendship[],
      outgoingFriendships: Friendship[]
    },
    loggedInUserID: number
  ): boolean {
    const friendShip = (
      (user?.incomingFriendships.length === 1 && user?.incomingFriendships[0]) ||
      (user?.outgoingFriendships.length === 1 && user?.outgoingFriendships[0])
    );
    const areFriends = (
      (friendShip?.senderId === loggedInUserID || friendShip?.receiverId === loggedInUserID)
      && friendShip?.status === 'ACCEPTED'
    );
    return areFriends;
  }

  public async findAll(): Promise<User[]> {
    return this._prismaService.user.findMany({
      include: {
        photos: true,
        likedEvents: true,
        incomingFriendships: true,
        outgoingFriendships: true,
        incomingNotification: true
      }
    });
  }

  public async searchAllByUsername(
    queryParams: SearchByUsernameDTO, loggedInUserID: number
  )
    : Promise<[User[], number]> {
    const { username, limit = 10, cursor = 0 } = queryParams;
    return (
      Promise.all([
        this._prismaService.user.findMany({
          ...configCursorBasedPagination(limit, cursor),
          where: {
            username: {
              startsWith: username,
              mode: 'insensitive'
            },
            NOT: { id: loggedInUserID }
          },
          include: {
            photos: { where: { order: 0 }, take: 1 },
          }
        }),
        this._prismaService.user.count({
          where: {
            username: {
              startsWith: username,
              mode: 'insensitive'
            }
          },
        })
      ])
    );
  }

  public async findByID(id: number, includePhotos = false) {
    return (
      this._prismaService.user.findUnique({
        where: { id },
        include: { photos: includePhotos }
      })
    );
  }

  public async findUniqueByField(queryParams: SearchByQueryParamsDTO) {
    if (queryParams.email && queryParams.username) {
      return this._prismaService.user.findFirst({
        where: {
          email: queryParams.email,
          username: queryParams.username
        }
      });
    }
    if (queryParams.email) {
      return this._prismaService.user.findFirst({
        where: {
          email: queryParams.email
        }
      });
    }
    if (queryParams.username) {
      return this._prismaService.user.findFirst({
        where: {
          username: queryParams.username
        }
      });
    }
  }

  public async findTargetUserWithFriendship(targetUuid: string, loggedInUserID: number) {
    try {
      const userFound = await this._prismaService.user.findUnique({
        where: { uid: targetUuid },
        include: {
          photos: true,
          likedEvents: {
            include: {
              event: {
                select: {
                  photos: { take: 1, where: { order: 0 } },
                }
              }
            },
            orderBy: { id: 'desc' },
            take: 5
          },
          // determines if targetUser is friend with loggedInUser
          incomingFriendships: {
            where: {
              OR: [{ receiverId: loggedInUserID }, { senderId: loggedInUserID }]
            },
          },
          outgoingFriendships: {
            where: {
              OR: [{ receiverId: loggedInUserID }, { senderId: loggedInUserID }]
            },
          }
        }
      });
      return {
        ...userFound,
        hasIncommingFriendshipInvitation: userFound['incomingFriendships']?.at(0)?.status === 'PENDING',
        hasOutgoingFriendshipInvitation: userFound['outgoingFriendships']?.at(0)?.status === 'PENDING',
        isFriend: this._areFriends(userFound, loggedInUserID)
      };
    }
    catch (error) {
      throw new Error(error.message);
    }
  }

  public async findUniqueUser(uuid: string) {
    return this._prismaService.user.findUnique({
      where: { uid: uuid },
      include: {
        photos: { orderBy: { order: 'asc' }, take: maxNumPhotosPerUser }
      }
    });
  }

  public async create(userDto: CreateUserDTO): Promise<User> {
    return this._prismaService.user.create({
      data: {
        username: userDto.username,
        email: userDto.email,
        name: userDto.name,
        uid: userDto.uid,
        birthday: userDto.birthday,
      }
    });
  }

  public async update(userID: number, userDto: UpdateUserDTO): Promise<User> {
    return this._prismaService.user.update({
      where: { id: userID },
      data: {
        ...userDto
      }
    });
  }

  public async deleteUserById(userId: number, photosIds: number[]) {
    return Promise.all([
      this._prismaService.user.delete({ where: { id: userId } }),  // photos will be deleted automatically
      this._deleteAllUserPhotos(userId, photosIds)
    ]);
  }

  public async saveUserPhotos(incomingImgFiles: Express.Multer.File[], userId: number, startCount: number): Promise<User> {
    try {
      const createdPhotos = await this._prismaService.userPhoto.createManyAndReturn({
        data: incomingImgFiles.map((_, index) => ({ userId, order: index + startCount })),
      });
      const photosToUpload = createdPhotos.map((photo, index) => ({
        id: photo.id,
        order: photo.order,
        file: incomingImgFiles[index],
        destinationPath: `${userId}/photos/${photo.id}`
      }));
      let userPhotos: IUploadedPhoto[] = [];
      try {
        userPhotos = await this._storageService.uploadPhotos(photosToUpload, 'users');
      } catch (error) {
        await this._prismaService.userPhoto.deleteMany({
          where: { id: { in: createdPhotos.map((photo) => photo.id) } }
        });
        throw new HttpError(400, 'Uploading user photos failed' + error.message);
      }
      return this._prismaService.user.update({
        where: { id: userId },
        data: {
          photos: {
            updateMany: userPhotos.map((photo) => ({
              where: { id: photo.id },
              data: {
                url: photo.url,
                placeholder: photo.placeholder,
                order: photo.order
              }
            }))
          }
        },
        include: {
          photos: true
        }
      });
    } catch (error) {
      throw new HttpError(400, 'Uploading user photos failed' + error.message);
    }
  }

  public async updateUserPhoto(userId: number, photoId: number, incomingImgFile: Express.Multer.File) {
    try {
      const photoToDelete: UserPhoto = await this._prismaService.userPhoto.findUnique({ where: { id: photoId } });
      const hashedPhoto: string = await this._storageService.generatePhotoBlurHashes(incomingImgFile.buffer);
      await this._storageService.deletePhotos(`${userId}/photos/${photoId}`, 'users');
      const createdPhoto: UserPhoto = await this._prismaService.userPhoto.create({ data: { userId } });
      let newPhotoUrl = '';
      try {
        newPhotoUrl = (await this._storageService.uploadPhoto(
          `${userId}/photos/${createdPhoto.id}`,
          incomingImgFile,
          createdPhoto.id,
          'users'
        ));
      } catch (error) {
        await this._prismaService.userPhoto.delete({ where: { id: createdPhoto.id } });
        throw new HttpError(400, 'Uploading user photos failed' + error.message);
      }
      const [updatedPhoto] = await this._prismaService.$transaction([
        this._prismaService.userPhoto.delete({ where: { id: photoToDelete.id } }),
        this._prismaService.userPhoto.update({
          where: { id: createdPhoto.id },
          data: {
            url: newPhotoUrl,
            placeholder: hashedPhoto,
            order: photoToDelete.order // dont remove
          }
        }),
      ]);
      return updatedPhoto;
    } catch (error) {
      throw new HttpError(400, 'Uploading user photos failed' + error.message);
    }
  }

  public async deleteUserPhotoById(userId: number, photoToDelete: UserPhoto) {
    const destinationPath = `${userId}/photos/${photoToDelete.id}`;
    await this._storageService.deletePhotos(destinationPath, 'users');
    await this._prismaService.userPhoto.delete({ where: { id: photoToDelete.id } });
    return this._prismaService.userPhoto.updateMany({
      where: {
        userId: photoToDelete.userId,
        order: { gte: photoToDelete.order } // reorders the remaining photos
      },
      data: {
        order: { decrement: 1 }  // reorders the remaining photos
      }
    });
  }

  private async _deleteAllUserPhotos(userId: number, photosIds: number[]) {
    if (photosIds.length === 0) return;
    // return this._storageService.deletePhotos(`${userId}/`, 'users');
    return Promise.all(
      photosIds.map((photoId) => {
        return this._storageService.deletePhotos(`${userId}/photos/${photoId}`, 'users');
      }));
  }

  public async getUsersWhoLikedSameEvent(
    loggedInUserID: number, { limit, cursor, eventId }: GetTargetUserEventsDTO
  )
    : Promise<[IUsersLikedSameEvent[], number]> {
    // EventLike model
    const whereCondition: Prisma.EventLikeWhereInput = {
      eventId, // all the likes for this event
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
            // since friendship are unique, here I will know if I have
            // a pending invitatopm
            outgoingFriendships: {     // this can be one or zero
              where: { receiverId: loggedInUserID },
            },
            incomingFriendships: {
              where: { senderId: loggedInUserID }
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
          hasIncommingFriendshipInvitation: likedEvent['user']['incomingFriendships']?.at(0)?.status === 'PENDING',
          hasOutgoingFriendshipInvitation: likedEvent['user']['outgoingFriendships']?.at(0)?.status === 'PENDING',
          isFriend: false
        }
      }));

    return [usersList, totalusersCount];
  }
}
