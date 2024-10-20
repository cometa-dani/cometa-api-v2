import { Container, Service } from 'typedi';
import { GetFriendshipsDto, FrienshipParamsDTo as FriendIdsDTo, UpdateFriendshipDto, FrienshipParamsDTo } from './frienship.dto';
import { TypedRequestHandlerBody, TypedRequestHandlerParams, TypedRequestHandlerQuery } from '../helpers/typeRequestHandlers';
import { BaseController } from '../helpers/basecontroller';
import { FriendshipService } from './friendship.service';


@Service()
export class FrienshipController extends BaseController {

  private _friendshipService = Container.get(FriendshipService);

  public searchFriendsWithPagination: TypedRequestHandlerQuery<GetFriendshipsDto> = async (req, res, next) => {
    try {
      const { cursor = 0, limit = 10 } = req.query;
      const [newFriends, totalFriends] = await this._friendshipService.searchFriendsByUsername(req.user.id, req.query);
      const nextCursor = newFriends.at(-1)?.id === 1 ? null : newFriends.at(-1)?.id ?? null;

      const paginatedFriends = {
        friendships: cursor > 0 ? newFriends.slice(1) : newFriends,
        nextCursor,
        totalFriendships: totalFriends,
        hasNextCursor: nextCursor !== null || newFriends.length < limit,
        friendshipsPerPage: limit
      };
      this.ok(res, paginatedFriends);
    }
    catch (error) {
      // If an error occurs, pass it to the error-handling middleware
      next(error);
    }
  };

  public getNewestFriendsWithPagination: TypedRequestHandlerQuery<GetFriendshipsDto> = async (req, res, next) => {
    try {
      const { cursor = 0, limit = 10 } = req.query;
      const [newFriends, totalFriendshipsCount] = await this._friendshipService.getFriendsWithPagination(req.query, req.user.id);
      const nextCursor = newFriends.at(-1)?.id === 1 ? null : newFriends.at(-1)?.id ?? null;

      const paginatedFriends = {
        friendships: cursor > 0 ? newFriends.slice(1) : newFriends,
        nextCursor,
        totalFriendships: totalFriendshipsCount,
        hasNextCursor: nextCursor !== null || newFriends.length < limit,
        friendshipsPerPage: limit
      };
      return this.ok(res, paginatedFriends);
    }
    catch (error) {
      next(error);
    }
  };

  public getFriendshipByTargetUserUUID: TypedRequestHandlerParams<FrienshipParamsDTo> = async (req, res, next) => {
    try {
      const foundFrienship = await this._friendshipService.getFriendshipByTargetUser(req.params.uuid, req.user.id);
      if (!foundFrienship) {
        return this.conflict(res);
      }
      return this.ok(res, foundFrienship);
    }
    catch (error) {
      next(error);
    }
  };

  public sentFriendShipInvitation: TypedRequestHandlerBody<FriendIdsDTo> = async (req, res, next) => {
    try {
      const newFriendshipInvitation = await this._friendshipService.sentFrienshipInvitation(req.body.id, req.user.id);
      this.created(res, newFriendshipInvitation);
    }
    catch (error) {
      next(error);
    }
  };

  /**
   *
   * @description unfollows a friendship
   */
  public updateFriendShipInvitation: TypedRequestHandlerParams<FriendIdsDTo, UpdateFriendshipDto> = async (req, res, next) => {
    try {
      const { status } = req.body;

      if (status === 'ACCEPTED') {
        const acceptedFrienship = await this._friendshipService.acceptFrienshipInvitation(req.params.id, req.user);
        return this.ok(res, acceptedFrienship);
      }
      if (status === 'PENDING') {
        const pendingFriendship = await this._friendshipService.resetFrienshipInvitation(req.params.id, req.user);
        return this.ok(res, pendingFriendship);
      }
      return this.badRequest(res);
    }
    catch (error) {
      next(error);
    }
  };

  public deleteFriendship: TypedRequestHandlerParams<FriendIdsDTo> = async (req, res, next) => {
    try {
      const noContent = await this._friendshipService.deleteFriendshipBySenderOrReceiver(req.params.id, req.user.id);
      if (!noContent) {
        return this.noContent(res, noContent);
      }
      return this.conflict(res);
    }
    catch (error) {
      next(error);
    }
  };
}
