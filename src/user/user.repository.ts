import 'reflect-metadata';
import { Service } from 'typedi';
import { prisma } from '../dataBaseConnection';
import { CreateUserDTO, UpdateUserDTO, UserPhotoDTO } from './user.dto';
import { UserPhoto, Friendship, User } from '@prisma/client';
import { configCursor } from '../helpers/configCursor';


@Service()
export default class UserRepository {
  private _prisma = prisma;


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


  async findMany(): Promise<User[]> {
    return this._prisma.user.findMany({
      include: {
        photos: true,
        likedEvents: true,
        incomingFriendships: true,
        outgoingFriendships: true,
        incomingNotification: true
      }
    });
  }


  async findManyByUsernameWithPagination(
    userName: string, limit: number, cursor: number, loggedInUserID: number
  ): Promise<[User[], number]> {

    return (
      Promise.all([
        this._prisma.user.findMany({
          ...configCursor(limit, cursor),
          where: {
            username: {
              startsWith: userName,
              mode: 'insensitive'
            },
            NOT: { id: loggedInUserID }
          },
          include: {
            photos: { where: { order: 0 }, take: 1 },
          }
        }),

        this._prisma.user.count({
          where: {
            username: {
              startsWith: userName,
              mode: 'insensitive'
            }
          },
        })
      ])
    );
  }


  async findByID(id: number, includePhotos = false) {
    return (
      await this._prisma.user.findUnique({
        where: { id },
        include: { photos: includePhotos }
      })
    );
  }


  async create(usertDto: CreateUserDTO): Promise<User> {
    return await this._prisma.user.create({
      data: {
        username: usertDto.username,
        email: usertDto.email,
        name: usertDto.name,
        uid: usertDto.uid,
        birthday: usertDto.birthday,
      }
    });
  }


  async update(userID: number, userDto: UpdateUserDTO): Promise<User> {
    return await this._prisma.user.update({
      where: { id: userID },
      data: {
        ...userDto
      }
    });
  }


  async updateUserPhotos(userPhotos: UserPhotoDTO[], userID: number): Promise<User> {
    return await this._prisma.user.update({
      where: { id: userID },
      data: {
        photos: {
          createMany: {
            data: userPhotos
          }
        }
      },
      include: {
        photos: true
      }
    });
  }


  async deletePhoto(photoToDelete: UserPhoto) {
    await this._prisma.userPhoto.delete({ where: { id: photoToDelete.id } });

    return this._prisma.userPhoto.updateMany({
      where: {
        userId: photoToDelete.userId,
        order: { gte: photoToDelete.order } // reorders the remaining photos
      },
      data: {
        order: { decrement: 1 }  // reorders the remaining photos
      }
    });
  }


  async findUniqueByField(field: 'email' | 'username', value: string): Promise<User> {
    return await this._prisma.user.findFirst({
      where: {
        [field]: value
      }
    });
  }


  async findTargetUserWithFriendship(targetUuid: string, loggedInUserID: number) {
    try {
      const userFound = await this._prisma.user.findUnique({
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


  async findUniqueUserWithLikedEvents(uuid: string) {
    return await this._prisma.user.findUnique({
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
}
