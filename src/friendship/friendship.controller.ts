import { Container, Service } from 'typedi';
import { GetFriendshipsDto, INewFriend, UpdateFriendshipDto } from './frienship.dto';
import { RequestHandlerBody, RequestHandlerParams, RequestHandlerQuery } from '../helpers/typeRequestHandlers';
import { BaseController } from '../helpers/baseController';
import { FriendshipService } from './friendship.service';
import { IdsDto, PaginatedResult } from '../shared/dto/baseDTOs';


@Service()
export class FrienshipController extends BaseController {
  private _friendshipService = Container.get(FriendshipService);

  public searchPaginatedFriends: RequestHandlerQuery<GetFriendshipsDto> =
    async (req, res, next) => {
      try {
        const { limit = 10 } = req.query;
        const [newFriends, totalFriends] = (
          await this._friendshipService.searchPaginatedFriendsByUsername(req.user.id, req.query)
        );
        const nextCursor = newFriends.at(-1)?.id ?? null;
        const paginatedFriends: PaginatedResult<INewFriend> = {
          items: newFriends,
          nextCursor,
          totalItems: totalFriends,
          hasNextCursor: newFriends.length === limit,
          itemsPerPage: limit
        };
        this.ok(res, paginatedFriends);
      }
      catch (error) {
        next(error); // If an error occurs, pass it to the error-handling middleware
      }
    };

  public getPaginatedNewestFriends: RequestHandlerQuery<GetFriendshipsDto> =
    async (req, res, next) => {
      try {
        const { limit = 10 } = req.query;
        const [newFriends, totalFriendshipsCount] =
          await this._friendshipService.getPaginatedNewestFriends(req.query, req.user.id);
        const nextCursor = newFriends.at(-1)?.id ?? null;
        const paginatedFriends: PaginatedResult<INewFriend> = {
          items: newFriends,
          nextCursor,
          totalItems: totalFriendshipsCount,
          hasNextCursor: newFriends.length === limit,
          itemsPerPage: limit
        };
        return this.ok(res, paginatedFriends);
      }
      catch (error) {
        next(error);
      }
    };

  public getFriendshipByTargetUserUUID: RequestHandlerParams<IdsDto> =
    async (req, res, next) => {
      try {
        const foundFrienship = (
          await this._friendshipService.getFriendshipByTargetUser(req.params.uid, req.user.id)
        );
        if (!foundFrienship) {
          return this.conflict(res);
        }
        return this.ok(res, foundFrienship);
      }
      catch (error) {
        next(error);
      }
    };

  public sentFriendShipInvitation: RequestHandlerBody<IdsDto> =
    async (req, res, next) => {
      try {
        const newFriendshipInvitation = (
          await this._friendshipService.sentFriendshipInvitation(req.body.id, req.user.id)
        );
        this.created(res, newFriendshipInvitation);
      }
      catch (error) {
        next(error);
      }
    };

  /**
   *
   * @description follows or unfollows a friendship
   */
  public updateFriendShipInvitation: RequestHandlerParams<IdsDto, UpdateFriendshipDto> =
    async (req, res, next) => {
      try {
        const { status } = req.body;
        if (status === 'ACCEPTED') {
          const acceptedFrienship =
            await this._friendshipService.acceptFrienshipInvitation(req.params.id, req.user);
          return this.ok(res, acceptedFrienship);
        }
        if (status === 'PENDING') {
          const pendingFriendship =
            await this._friendshipService.resetFriendshipInvitation(req.params.id, req.user);
          return this.ok(res, pendingFriendship);
        }
        return this.badRequest(res);
      }
      catch (error) {
        next(error);
      }
    };

  public deleteFriendship: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const noContent = (
        await this._friendshipService.deleteBySenderOrReceiver(req.params.id, req.user.id)
      );
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
