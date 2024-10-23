import { Service, Container } from 'typedi';
import { SearchByQueryParamsDTO, CreateUserDTO, SearchByUsernameDTO, UpdateUserDTO } from './user.dto';
import { CloudStorageService } from '../shared/cloudStorage/cloud-storage.service';
import { UserPhoto, User, Friendship } from '@prisma/client';
import { PrismaService } from '../config/dataBase';
import { configCursor } from '../helpers/configCursor';
import { HttpError } from '../helpers/httpError';


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

  public async searchAllByUsername(queryParams: SearchByUsernameDTO, loggedInUserID: number): Promise<[User[], number]> {
    const { username, limit, cursor } = queryParams;
    return (
      Promise.all([
        this._prismaService.user.findMany({
          ...configCursor(limit, cursor),
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
      await this._prismaService.user.findUnique({
        where: { id },
        include: { photos: includePhotos }
      })
    );
  }

  public async findUniqueByField(queryParams: SearchByQueryParamsDTO) {
    if (queryParams.email) {
      return await this._prismaService.user.findFirst({
        where: {
          email: queryParams.email
        }
      });
    }
    if (queryParams.username) {
      return await this._prismaService.user.findFirst({
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
    return await this._prismaService.user.findUnique({
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

  public async create(usertDto: CreateUserDTO): Promise<User> {
    return await this._prismaService.user.create({
      data: {
        username: usertDto.username,
        email: usertDto.email,
        name: usertDto.name,
        uid: usertDto.uid,
        birthday: usertDto.birthday,
      }
    });
  }

  public async update(userID: number, userDto: UpdateUserDTO): Promise<User> {
    return await this._prismaService.user.update({
      where: { id: userID },
      data: {
        ...userDto
      }
    });
  }

  public async saveUserPhotos(incommingImgFiles: Express.Multer.File[], userID: number, startCount: number): Promise<User> {
    try {
      const userPhotos = (
        await this._cloudStorageService.uploadManyPhotosToBucket(`users/${userID}`, incommingImgFiles, startCount)
      );
      return this._prismaService.user.update({
        where: { id: userID },
        data: {
          photos: {
            createMany: {
              data: userPhotos,
            }
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

  public async deleteUserPhoto(userId: number, photoToDelete: UserPhoto) {
    const destinationPath = `users/${userId}/photos/${photoToDelete.order}`;
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
}
