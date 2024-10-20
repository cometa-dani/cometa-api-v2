import Container, { Service } from 'typedi';
import { PrismaService } from '../config/dataBase';
import { Prisma, User } from '@prisma/client';
import { NewFriend, GetFriendshipsDto } from './frienship.dto';
import { HttpError } from '../helpers/httpError';
import { ErrorMessage } from '../helpers/errorMessages';


@Service()
export class FriendshipService {
  private _prisma = Container.get(PrismaService);

  public async searchFriendsByUsername(
    loggedInUserID: number, paginatedQueries: GetFriendshipsDto
  ): Promise<[Omit<NewFriend, 'sender' | 'receiver'>[], number]> {
    const { cursor, limit, friendUserName } = paginatedQueries;

    const whereCondition: Prisma.FriendshipWhereInput = {
      OR: [
        { senderId: loggedInUserID, status: 'ACCEPTED', receiver: { username: { startsWith: friendUserName, mode: 'insensitive' } } },
        { receiverId: loggedInUserID, status: 'ACCEPTED', sender: { username: { startsWith: friendUserName, mode: 'insensitive' } } },
      ],
    };
    // Query the database to find friends where the current authenticated user is either the sender or receiver
    const query: Prisma.FriendshipFindManyArgs = ({
      include: {
        receiver: { include: { photos: { take: 1, where: { order: 0 } } } },
        sender: { include: { photos: { take: 1, where: { order: 0 } } } },
      },
      where: whereCondition,
      cursor: cursor > 0 ? { id: cursor } : undefined,
      take: cursor > 0 ? limit + 1 : limit,
    });
    const [totalFriendships, friendships] = (
      await
        Promise.all([
          this._prisma.friendship.count({ where: whereCondition }),
          this._prisma.friendship.findMany(query)
        ])
    );
    const newFriends = (friendships as Array<NewFriend>).map(
      ({ receiver, sender, ...rest }) => ({
        ...rest,
        // if the authenticated user's id is equal to senderId then return receiver
        // otherwise return sender
        friend: loggedInUserID === sender.id ? receiver : sender
      })
    );

    return [newFriends, totalFriendships];
  }

  public async getFriendsWithPagination(
    queryParams: GetFriendshipsDto,
    loggedInUserID: number

  ): Promise<[Omit<NewFriend, 'sender' | 'receiver'>[], number]> {

    const { cursor, limit } = queryParams;
    const whereCondition: Prisma.FriendshipWhereInput = {
      OR: [
        { senderId: loggedInUserID, status: 'ACCEPTED' },
        { receiverId: loggedInUserID, status: 'ACCEPTED' },
      ],
    };
    // Query the database to find friends where the current authenticated user is either the sender or receiver
    const query: Prisma.FriendshipFindManyArgs = ({
      orderBy: { id: 'desc' },
      include: {
        receiver: { include: { photos: { take: 1, where: { order: 0 } } } },
        sender: { include: { photos: { take: 1, where: { order: 0 } } } },
      },
      where: { ...whereCondition },
      cursor: cursor > 0 ? { id: cursor } : undefined,
      take: cursor > 0 ? limit + 1 : limit,
    });
    const [totalFriendshipsCount, friendships] = (
      await
        Promise.all([
          this._prisma.friendship.count({ where: whereCondition }),
          this._prisma.friendship.findMany(query)
        ])
    );
    const newFriends = (friendships as Array<NewFriend>).map(
      ({ receiver, sender, ...rest }) => ({
        ...rest,
        // if the authenticated user's id is equal to senderId then return receiver
        // otherwise return sender
        friend: loggedInUserID === sender.id ? receiver : sender
      })
    ) ?? [];
    return [newFriends, totalFriendshipsCount];
  }

  public async getFriendshipByTargetUser(targetUserUUID: string, loggedInUserID: number) {
    const targetUser = await this._prisma.user.findUnique({ where: { uid: targetUserUUID } });
    if (!targetUser) {
      throw new HttpError(404, 'user not found');
    }
    // Check if the friendship already exists by querying the database
    const friendship = await this._prisma.friendship.findFirst({
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

  public async sentFrienshipInvitation(targetUserId: number, loggedInUserID: number) {
    const friendshipExists = await this._prisma.friendship.findFirst({
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
    const newFriendshipInvitation = await this._prisma.friendship.create({
      data: {
        senderId: loggedInUserID,
        receiverId: targetUserId,
        status: 'PENDING'
      }
    });
    return newFriendshipInvitation;
  }

  public async acceptFrienshipInvitation(targetUserID: number, loggedInUser: User) {
    const friendshipExists = await this._prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: targetUserID, receiverId: loggedInUser.id },
          { senderId: loggedInUser.id, receiverId: targetUserID }
        ]
      },
      include: { sender: { select: { uid: true } } }
    });
    // first time
    if (friendshipExists && friendshipExists.status === 'PENDING') {
      const friendShip = await this._prisma.friendship.update({
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
    // atfer first time
    if (friendshipExists && friendshipExists.status === 'PENDING') {
      const friendShip = await this._prisma.friendship.update({
        where: {
          id: friendshipExists.id
        },
        data: {
          status: 'ACCEPTED',
        }
      });
      return friendShip;
    }
    throw new HttpError(409, ErrorMessage.INVITATION_DOES_NOT_EXIST);
  }

  public async resetFrienshipInvitation(targetUserID: number, loggedInUser: User) {
    const friendshipExists = await this._prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: targetUserID, receiverId: loggedInUser.id },
          { senderId: loggedInUser.id, receiverId: targetUserID }
        ]
      }
    });
    if (friendshipExists && friendshipExists.status === 'ACCEPTED') {
      const updatedFriendship =
        await this._prisma.friendship.update({
          where: { id: friendshipExists.id },
          data: { status: 'PENDING' }
        });
      return updatedFriendship;
    }
    throw new HttpError(409, ErrorMessage.INVITATION_DOES_NOT_EXIST);
  }

  public async deleteFriendshipBySenderOrReceiver(tagetUserID: number, loggedInUserID: number) {
    const friendshipExists = await this._prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: tagetUserID, receiverId: loggedInUserID },
          { senderId: loggedInUserID, receiverId: tagetUserID }
        ]
      }
    });
    if (friendshipExists) {
      await this._prisma.friendship.delete({
        where: {
          id: friendshipExists.id
        }
      });
      return undefined;
    }
    throw new HttpError(409, ErrorMessage.FRIENSHIP_NOT_FOUND);
  }
}
