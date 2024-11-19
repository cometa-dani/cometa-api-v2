import { Service, Container } from 'typedi';
import { SearchByQueryParamsDTO, CreateUserDTO, SearchByUsernameDTO, UpdateUserDTO } from './user.dto';
import { CloudStorageService } from '../shared/cloudStorage/cloud-storage.service';
import { UserPhoto, User, Friendship } from '@prisma/client';
import { PrismaService } from '../../config/dataBase';
import { configCursorBasedPagination } from '../../helpers/configCursor';
import { HttpError } from '../../helpers/httpError';


@Service()
export class UserService {
  private _prismaService = Container.get(PrismaService);
  private _cloudStorageService = Container.get(CloudStorageService);

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
        hasIncommingFriendship: userFound['incomingFriendships']?.at(0)?.status === 'PENDING',
        hasOutgoingFriendship: userFound['outgoingFriendships']?.at(0)?.status === 'PENDING',
        isFriend: this._areFriends(userFound, loggedInUserID)
      };
    }
    catch (error) {
      throw new Error(error.message);
    }
  }

  public async findUniqueWithLikeEvents(uuid: string) {
    return this._prismaService.user.findUnique({
      where: { uid: uuid },
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
        }
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
      this._deleteAllUserPhotosFromBucket(userId, photosIds)
    ]);
  }

  public async saveUserPhotos(incomingImgFiles: Express.Multer.File[], userId: number, startCount: number): Promise<User> {
    try {
      const createdPhotos = await this._prismaService.userPhoto.createManyAndReturn({
        data: incomingImgFiles.map((_, index) => ({ userId, order: startCount + index })),
      });
      const photosToUpload = createdPhotos.map((photo, index) => ({
        id: photo.id,
        order: photo.order,
        file: incomingImgFiles[index],
        destinationPath: `users/${userId}/photos/${photo.id}`
      }));
      const userPhotos = await this._cloudStorageService.uploadPhotosToBucket(photosToUpload);
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
      throw new HttpError(500, 'Uploading user photos failed' + error.message);
    }
  }

  public async deleteUserPhotoById(userId: number, photoToDelete: UserPhoto) {
    const destinationPath = `users/${userId}/photos/${photoToDelete.id}`;
    await this._cloudStorageService.deletePhotoFromBucket(destinationPath);
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

  private async _deleteAllUserPhotosFromBucket(userId: number, photosIds: number[]) {
    if (photosIds.length === 0) return;
    return Promise.all(
      photosIds.map((photoId) => {
        return this._cloudStorageService.deletePhotoFromBucket(`users/${userId}/photos/${photoId}`);
      }));
  }
}
