import { Service, Container } from 'typedi';
import { FiendshipRepository } from './friendship.repository';
import { PaginatedQueriesDto } from './frienship.dto';
import { User } from '@prisma/client';


@Service()
export class FriendshipService {

  private _friendshipRepository = Container.get(FiendshipRepository);

  searchFriendsByUsername(loggedInUserID: number, paginatedQueries: PaginatedQueriesDto) {
    return this._friendshipRepository.searchFriendsByUsername(loggedInUserID, paginatedQueries);
  }

  getFriendsWithPagination(queryParams: PaginatedQueriesDto, loggedInUserID: number) {
    return this._friendshipRepository.getLatestFriendsWithPagination(queryParams, loggedInUserID);
  }

  getFriendshipByTargetUser(targetUserUUID: string, loggedInUserID: number) {
    return this._friendshipRepository.getFriendshipByTargetUser(targetUserUUID, loggedInUserID);
  }

  sentFrienshipInvitation(targetUserID: number, loggedInUserID: number) {
    return this._friendshipRepository.sentFriendship(targetUserID, loggedInUserID);
  }

  acceptFrienshipInvitation(targetUserID: number, loggedInUser: User) {
    return this._friendshipRepository.acceptFriendship(targetUserID, loggedInUser);
  }

  resetFrienshipInvitation(targetUserID: number, loggedInUser: User) {
    return this._friendshipRepository.resetInvitation(targetUserID, loggedInUser);
  }

  deleteFriendshipBySenderOrReceiver(targetUserID: number, loggedInUserID: number) {
    return this._friendshipRepository.deleteFriendship(targetUserID, loggedInUserID);
  }
}
