import { RequestHandler } from 'express';
import { prisma } from '../../dataBaseConnection';
import * as schemma from '../frienship.dto';
import { Prisma, Friendship, User } from '@prisma/client';


interface NewFriend extends Friendship {
  sender: User,
  receiver: User
}

/**
 * Controller to get all friends with pagination.
 *
 * This function retrieves a list of friends for the current user with support for pagination.
 *
 * @function
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 *
 * @returns {void}
 */
export const getLatestFriendsWithPagination: RequestHandler = async (req, res, next) => {
  try {
    // Parse the limit & cursor from the query parameters using a validation schema
    const paginatedQueries = schemma.paginatedQueries.safeParse(req.query);

    if (!paginatedQueries.success) {
      return res.status(400).json({ error: 'Validation error', issues: paginatedQueries['error']?.issues });
    }

    const { cursor, limit } = paginatedQueries.data;

    const whereCondition: Prisma.FriendshipWhereInput = {
      OR: [
        { senderId: req.user.id, status: 'ACCEPTED' },
        { receiverId: req.user.id, status: 'ACCEPTED' },
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
          prisma.friendship.count({ where: whereCondition }),
          prisma.friendship.findMany(query)
        ])
    );

    const newFriends = (friendships as Array<NewFriend>).map(
      ({ receiver, sender, ...rest }) => ({
        ...rest,
        // if the authenticated user's id is equal to senderId then return receiver
        // otherwise return sender
        friend: req.user.id === sender.id ? receiver : sender
      })
    );

    // since we are counting down from the latest items in the table,
    // when we reach the first item, we should stop looking for the next cursor.
    const nextCursor = newFriends.at(-1)?.id === 1 ? null : newFriends.at(-1)?.id ?? null;
    res
      .status(200)
      .json({
        friendships: cursor > 0 ? newFriends.slice(1) : newFriends,
        nextCursor,
        totalFriendships: totalFriendshipsCount,
        friendshipsPerPage: limit
      });
  }
  catch (error) {
    // If an error occurs, pass it to the error-handling middleware
    next(error);
  }
};


/**
 * Controller to get all friends with pagination.
 *
 * This function retrieves a list of friends for the current user with support for pagination.
 *
 * @function
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 *
 * @returns {void}
 */
export const searchFriendsWithPagination: RequestHandler = async (req, res, next) => {
  try {
    // Parse the limit & cursor from the query parameters using a validation schema
    const paginatedQueries = schemma.paginatedQueries.safeParse(req.query);

    if (!paginatedQueries.success) {
      return res.status(400).json({ error: 'Validation error', issues: paginatedQueries['error']?.issues });
    }

    const { cursor, limit, friendUserName } = paginatedQueries.data;

    const whereCondition: Prisma.FriendshipWhereInput = {
      OR: [
        { senderId: req.user.id, status: 'ACCEPTED', receiver: { username: { startsWith: friendUserName, mode: 'insensitive' } } },
        { receiverId: req.user.id, status: 'ACCEPTED', sender: { username: { startsWith: friendUserName, mode: 'insensitive' } } },
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

    const [totalFriendshipsCount, friendships] = (
      await
        Promise.all([
          prisma.friendship.count({ where: whereCondition }),
          prisma.friendship.findMany(query)
        ])
    );

    const newFriends = (friendships as Array<NewFriend>).map(
      ({ receiver, sender, ...rest }) => ({
        ...rest,
        // if the authenticated user's id is equal to senderId then return receiver
        // otherwise return sender
        friend: req.user.id === sender.id ? receiver : sender
      })
    );

    // since we are counting down from the latest items in the table,
    // when we reach the first item, we should stop looking for the next cursor.
    const nextCursor = newFriends.at(-1)?.id === 1 ? null : newFriends.at(-1)?.id ?? null;
    res
      .status(200)
      .json({
        friendships: cursor > 0 ? newFriends.slice(1) : newFriends,
        nextCursor,
        totalFriendships: totalFriendshipsCount,
        friendshipsPerPage: limit
      });
  }
  catch (error) {
    // If an error occurs, pass it to the error-handling middleware
    next(error);
  }
};


/**
 * Controller to get a friendship by sender id and reciver id
 *
 * This function handles the creation of a friendship invitation between the current user and another user.
 * It includes validation, checking for existing friendships, and creating a new friendship entry.
 *
 * @function
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 *
 * @returns {void}
 */
export const getFriendshipByTargetUserUUID: RequestHandler = async (req, res, next) => {
  try {
    // Parse the receiver id from the query parameters using a validation schema
    const urlParam = schemma.paramsSchemma.safeParse(req.params);

    // If the validation fails, respond with a 400 Bad Request and provide validation issues
    if (!urlParam.success) {
      return res.status(400).json({ error: 'Validation failed', issues: urlParam['error'].issues });
    }

    // TODO: remove in the future for @id(uuid()) in prisma schemma
    const targetUser = await prisma.user.findUnique({ where: { uid: urlParam.data.uuid } });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the friendship already exists by querying the database
    const friendship = await prisma.friendship.findMany({
      where: {
        OR: [
          { receiverId: targetUser.id, senderId: req.user.id, status: 'ACCEPTED' },
          { senderId: targetUser.id, receiverId: req.user.id, status: 'ACCEPTED' }
        ]
      },
      include: {
        receiver: { include: { photos: { take: 1, where: { order: 0 } } } },
        sender: { include: { photos: { take: 1, where: { order: 0 } } } }
      }
    });

    if (friendship.length === 1) {
      // if (!friendship[0]?.chatuuid) {
      //   const updatedFriendShip = await prisma.friendship.update({
      //     where: { id: friendship[0].id },
      //     data: {
      //       // chatuuid: `${req.user.uid}__${targetUser.uid}`
      //     }
      //   });

      //   return res.status(200).json(updatedFriendShip);
      // }

      return res.status(200).json(friendship[0]);
    }
    else {
      return res.status(404).json({ error: 'friendship not found' });
    }
  }
  catch (error) {
    next(error);
  }
};


/**
 * Controller to create a friendship invitation. It needs both receiverID and senderID
 *
 * This function handles the creation of a friendship invitation between the current user and another user.
 * It includes validation, checking for existing friendships, and creating a new friendship entry.
 *
 * @function
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 *
 * @returns {void}
 */
export const sentFriendShipInvitation: RequestHandler = async (req, res, next) => {
  try {
    // Parse the new friend id from the request body using a validation schema
    const friendId = schemma.paramsSchemma.safeParse(req.body);

    // If the validation fails, respond with a 400 Bad Request and provide validation issues
    if (!friendId.success) {
      return res.status(400).json({ error: 'Validation failed', issues: friendId['error'].issues });
    }

    // Check if the friendship already exists by querying the database
    const friendshipExists = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: friendId.data.id },
          { senderId: friendId.data.id, receiverId: req.user.id }
        ]
      }
    });

    // If the friendship already exists, respond with a 409 Conflict status
    if (friendshipExists.length === 1) {
      return res.status(409).json({ error: 'Friendship already exists' });
    }

    // Create a new friendship entry in the database with 'PENDING' status
    const newFriendshipInvitation = await prisma.friendship.create({
      data: {
        senderId: req.user.id,
        receiverId: friendId.data.id,
        status: 'PENDING'
      }
    });

    // Respond with a 201 Created status and send the newly created friendship as JSON
    res.status(201).json(newFriendshipInvitation);
  }
  catch (error) {
    // If an error occurs, pass it to the error-handling middleware
    next(error);
  }
};


/**
 * Controller to cancel a friendship invitation. It needs both receiverID and senderID
 *
 * This function handles the creation of a friendship invitation between the current user and another user.
 * It includes validation, checking for existing friendships, and creating a new friendship entry.
 *
 * @function
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 *
 * @returns {void}
 */
export const deleteFriendShipInvitation: RequestHandler = async (req, res, next) => {
  try {
    // Parse the receiver id from the url parameters using a validation schema
    const receiver = schemma.paramsSchemma.safeParse(req.params);

    // If the validation fails, respond with a 400 Bad Request and provide validation issues
    if (!receiver.success) {
      return res.status(400).json({ error: 'Validation failed', issues: receiver['error'].issues });
    }

    // Check if the friendship already exists by querying the database
    const friendshipExists = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: receiver.data.id, receiverId: req.user.id },
          { senderId: req.user.id, receiverId: receiver.data.id }
        ]
      }
    });

    // If the friendship does not exists, respond with a 409 Conflict status
    if (!friendshipExists) {
      return res.status(409).json({ error: 'Friendship does not exist' });
    }

    // TODO: If friendship is accepted, delete the frienship id from firestore
    // if (friendshipExists.status === 'ACCEPTED') {
    //   await new Firestore().doc(`chats/${friendshipExists.chatuuid}`).delete();
    // }

    // deletes friendship entry in the database with 'PENDING' status
    await prisma.friendship.delete({
      where: {
        id: friendshipExists.id
      }
    });

    // Respond with a 204 no content status
    res.status(204).json({ message: 'User deleted successfully' });
  }
  catch (error) {
    // If an error occurs, pass it to the error-handling middleware
    next(error);
  }
};


/**
 * Controller to create a friendship invitation. It only needs a friendship ID
 *
 * This function handles the creation of a friendship invitation between the current user and another user.
 * It includes validation, checking for existing friendships, and creating a new friendship entry.
 *
 * @function
 * @async
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 *
 * @returns {void}
 */
export const acceptFriendShipInvitation: RequestHandler = async (req, res, next) => {
  try {
    // Parse the friendId from the url parameter using a validation schema
    const friendShipIdParam = schemma.paramsSchemma.safeParse(req.params);

    // If the validation fails, respond with a 400 Bad Request and provide validation issues
    if (!friendShipIdParam.success) {
      return res.status(400).json({ error: 'Validation failed', issues: friendShipIdParam['error'].issues });
    }

    const friendshipExists = await prisma.friendship.findUnique({
      where: {
        id: friendShipIdParam.data.id, status: 'PENDING'
      },
      include: { sender: { select: { uid: true } } }
    });

    if (friendshipExists) {
      // Create a new friendship entry in the database with 'PENDING' status
      const friendShip = await prisma.friendship.update({
        where: {
          id: friendShipIdParam.data.id
        },
        data: {
          status: 'ACCEPTED',
          // chatuuid: `${req.user.uid}__${friendshipExists.sender.uid}`
        }
      });

      // Respond with a 200 updates status and send the newly created friendship as JSON
      res.status(200).json(friendShip);
    }
    else {
      res.status(409).json({ error: 'No friendship invitation exists already' });
    }
  }
  catch (error) {
    // If an error occurs, pass it to the error-handling middleware
    next(error);
  }
};
