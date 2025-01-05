import Container, { Service } from 'typedi';
import { PrismaService } from '../../config/dataBase';
import { Friendship, Prisma, User } from '@prisma/client';
import { INewFriend, GetFriendshipsDto, IGetFriend } from './frienship.dto';
import { HttpError } from '../../helpers/httpError';
import { ErrorMessage } from '../../helpers/errorMessages';
import { configCursorBasedPagination } from '../../helpers/configCursor';


@Service()
export class FriendshipService {
  private _prismaService = Container.get(PrismaService);

  public async searchPaginatedFriendsByUsername(
    loggedInUserID: number,
    paginatedQueries: GetFriendshipsDto
  )
    : Promise<[IGetFriend[], number]> {
    const { cursor, limit, friendUserName } = paginatedQueries;
    const whereCondition: Prisma.FriendshipWhereInput = {
      OR: [
        { senderId: loggedInUserID, status: 'ACCEPTED', receiver: { username: { startsWith: friendUserName, mode: 'insensitive' } } },
        { receiverId: loggedInUserID, status: 'ACCEPTED', sender: { username: { startsWith: friendUserName, mode: 'insensitive' } } },
      ],
    };
    // Query the database to find friends where the current authenticated user is either the sender or receiver
    const query: Prisma.FriendshipFindManyArgs = ({
      select: {
        messages: false,
        lastMessageAt: false
      },
      include: {
        receiver: { include: { photos: { take: 1, where: { order: 0 } } } },
        sender: { include: { photos: { take: 1, where: { order: 0 } } } },
      },
      where: whereCondition,
      ...configCursorBasedPagination(limit, cursor),
    });
    const [totalFriendships, friendships] = (
      await
        Promise.all([
          this._prismaService.friendship.count({ where: whereCondition }),
          this._prismaService.friendship.findMany(query)
        ])
    );
    const newFriends = (friendships as Array<INewFriend>).map(
      ({ receiver, sender, ...rest }) => ({
        ...rest,
        // if the authenticated user's id is equal to senderId then return receiver
        // otherwise return sender
        friend: loggedInUserID === sender.id ? receiver : sender
      })
    );

    return [newFriends, totalFriendships];
  }

  public async getPaginatedNewestFriends(
    queryParams: GetFriendshipsDto,
    loggedInUserID: number
  )
    : Promise<[IGetFriend[], number]> {
    const { cursor, limit } = queryParams;
    const whereCondition: Prisma.FriendshipWhereInput = {
      OR: [
        { senderId: loggedInUserID, status: 'ACCEPTED' },
        { receiverId: loggedInUserID, status: 'ACCEPTED' },
      ],
    };
    // Query the database to find friends where the current authenticated user is either the sender or receiver
    const query: Prisma.FriendshipFindManyArgs = ({
      select: {
        messages: false,
        lastMessageAt: false
      },
      include: {
        receiver: { include: { photos: { take: 1, where: { order: 0 } } } },
        sender: { include: { photos: { take: 1, where: { order: 0 } } } },
      },
      where: { ...whereCondition },
      ...configCursorBasedPagination(limit, cursor),
    });
    const [totalFriendshipsCount, friendships] = (
      await
        Promise.all([
          this._prismaService.friendship.count({ where: whereCondition }),
          this._prismaService.friendship.findMany(query)
        ])
    );
    const newFriends = (friendships as Array<INewFriend>).map(
      ({ receiver, sender, ...rest }) => ({
        ...rest,
        // if the authenticated user's id is equal to senderId then return receiver
        // otherwise return sender
        friend: loggedInUserID === sender.id ? receiver : sender
      })
    ) ?? [];
    return [newFriends, totalFriendshipsCount];
  }

  public async getFriendshipByTargetUser(targetUserUUID: string, loggedInUserID: number): Promise<Friendship> {
    const targetUser = await this._prismaService.user.findUnique({ where: { uid: targetUserUUID } });
    if (!targetUser) {
      throw new HttpError(404, 'user not found');
    }
    // Check if the friendship already exists by querying the database
    const friendship = await this._prismaService.friendship.findFirst({
      where: {
        OR: [
          { receiverId: targetUser.id, senderId: loggedInUserID, status: 'ACCEPTED' },
          { senderId: targetUser.id, receiverId: loggedInUserID, status: 'ACCEPTED' }
        ]
      },
      include: {
        receiver: { include: { photos: { take: 1, where: { order: 0 } } } },
        sender: { include: { photos: { take: 1, where: { order: 0 } } } }
      }
    });
    if (!friendship) {
      throw new HttpError(404, 'friendship not found');
    }
    return friendship;
  }

  public async sentFriendshipInvitation(targetUserId: number, loggedInUserID: number): Promise<Friendship> {
    const friendshipExists = await this._prismaService.friendship.findFirst({
      where: {
        OR: [
          { senderId: targetUserId, receiverId: loggedInUserID },
          { senderId: loggedInUserID, receiverId: targetUserId }
        ]
      }
    });
    if (friendshipExists && friendshipExists.status === 'PENDING') {
      throw new HttpError(409, ErrorMessage.INVITATION_ALREADY_PENDING);
    }
    return (
      this._prismaService.friendship.create({
        data: {
          senderId: loggedInUserID,
          receiverId: targetUserId,
          status: 'PENDING'
        }
      })
    );
  }

  public async acceptFrienshipInvitation(targetUserID: number, loggedInUser: User): Promise<Friendship> {
    const friendshipExists = await this._prismaService.friendship.findFirst({
      where: {
        OR: [
          { senderId: targetUserID, receiverId: loggedInUser.id },
          { senderId: loggedInUser.id, receiverId: targetUserID }
        ]
      },
      // include: { sender: { select: { uid: true } } }
    });
    // first time
    if (friendshipExists && friendshipExists.status === 'PENDING') {
      const friendShip = await this._prismaService.friendship.update({
        where: {
          id: friendshipExists.id
        },
        data: {
          status: 'ACCEPTED',
          // chatuuid: `${friendshipExists.sender.uid}__${loggedInUser.uid}`
        }
      });
      return friendShip;
    }
    throw new HttpError(409, ErrorMessage.INVITATION_DOES_NOT_EXIST);
    // // atfer first time
    // if (friendshipExists && friendshipExists.status === 'PENDING') {
    //   const friendShip = await this._prismaService.friendship.update({
    //     where: {
    //       id: friendshipExists.id
    //     },
    //     data: {
    //       status: 'ACCEPTED',
    //     }
    //   });
    //   return friendShip;
    // }
  }

  public async resetFriendshipInvitation(targetUserID: number, loggedInUser: User): Promise<Friendship> {
    const friendshipExists = await this._prismaService.friendship.findFirst({
      where: {
        OR: [
          { senderId: targetUserID, receiverId: loggedInUser.id },
          { senderId: loggedInUser.id, receiverId: targetUserID }
        ]
      }
    });
    if (friendshipExists && friendshipExists.status === 'ACCEPTED') {
      const updatedFriendship =
        await this._prismaService.friendship.update({
          where: { id: friendshipExists.id },
          data: { status: 'PENDING' }
        });
      return updatedFriendship;
    }
    throw new HttpError(409, ErrorMessage.INVITATION_DOES_NOT_EXIST);
  }

  public async deleteBySenderOrReceiver(tagetUserID: number, loggedInUserID: number): Promise<null> {
    const friendshipExists = await this._prismaService.friendship.findFirst({
      where: {
        OR: [
          { senderId: tagetUserID, receiverId: loggedInUserID },
          { senderId: loggedInUserID, receiverId: tagetUserID }
        ]
      }
    });
    if (friendshipExists) {
      await this._prismaService.friendship.delete({
        where: {
          id: friendshipExists.id
        }
      });
      return undefined;
    }
    throw new HttpError(409, ErrorMessage.FRIENSHIP_NOT_FOUND);
  }
}
