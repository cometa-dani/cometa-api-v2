import { Service, Container } from 'typedi';
import { BaseController } from '../../helpers/baseController';
import { RequestHandlerBody, RequestHandlerParams, RequestHandlerQuery } from '../../helpers/typeRequestHandlers';
import { UserService } from './user.service';
import { IdsDto, PaginatedResult } from '../shared/dto/baseDTOs';
import { SearchByQueryParamsDTO, CreateUserDTO, SearchByUsernameDTO, UpdateUserDTO } from './user.dto';
import { ErrorMessage } from '../../helpers/errorMessages';
import { User } from '@prisma/client';
import { maxNumPhotosPerUser } from '../../vars';


@Service()
export class UserController extends BaseController {
  private _userService = Container.get(UserService);
  private _maxNumPhotos = maxNumPhotosPerUser;

  constructor() {
    super();
  }

  public getAllUsers: RequestHandlerQuery = async (_, res, next) => {
    try {
      const users = await this._userService.findAll();
      return this.ok(res, users);
    }
    catch (error) {
      next(error);
    }
  };

  public searchPaginatedUsersByUsername: RequestHandlerQuery<SearchByUsernameDTO> = async (req, res, next) => {
    try {
      const { limit = 10 } = req.query;
      const [users, count] = await this._userService.searchAllByUsername(req.query, req.user.id);
      const nextCursor = users.at(-1)?.id ?? null;
      const paginatedUsers: PaginatedResult<User> = {
        items: users,
        totalItems: count,
        nextCursor,
        hasNextCursor: users.length === limit,
        itemsPerPage: limit,
      };
      return this.ok(res, paginatedUsers);
    }
    catch (error) {
      next(error);
    }
  };

  public findUniqueUserByQueryParams: RequestHandlerQuery<SearchByQueryParamsDTO> = async (req, res, next) => {
    try {
      const { email, username } = req.query;
      if (email) {
        const userFound = await this._userService.findUniqueByField({ email });
        if (!userFound) {
          return this.notFound(res);
        }
        return this.ok(res, userFound);
      }
      if (username) {
        const userFound = await this._userService.findUniqueByField({ username });
        if (!userFound) {
          return this.notFound(res);
        }
        return this.ok(res, userFound);
      }
      return this.badRequest(res, ErrorMessage.NO_QUERY_PARAMS_PROVIDED);
    }
    catch (error) {
      next(error);
    }
  };

  //TODO: specify two different methods for loggedInUser and targetUser
  public getUserProfile: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const userFound = await this._userService.findUniqueUser(req.params.uid); // authMiddleware should be remove
      if (!userFound) {
        return this.notFound(res);
      }
      return this.ok(res, { ...userFound, maxNumPhotos: this._maxNumPhotos });
    }
    catch (error) {
      next(error);
    }
  };

  public getTargetUserWithFriendship: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const userFound = await this._userService.findTargetUserWithFriendship(req.params.uid, req.user.id);
      if (!userFound) {
        return this.notFound(res);
      }
      return this.ok(res, { ...userFound, maxNumPhotos: this._maxNumPhotos });
    }
    catch (error) {
      next(error);
    }
  };

  public createUser: RequestHandlerBody<CreateUserDTO> = async (req, res, next) => {
    try {
      const userFound = await this._userService.findUniqueByField({ email: req.body.email, username: req.body.username });
      if (userFound) {
        return this.conflict(res, ErrorMessage.ALREADY_EXISTS);
      }
      const userCreated = await this._userService.create(req.body);
      if (!userCreated) {
        return this.conflict(res, ErrorMessage.COULD_NOT_CREATE);
      }
      return this.created(res, userCreated);
    }
    catch (error) {
      next(error);
    }
  };

  public updateUserByID: RequestHandlerParams<IdsDto, UpdateUserDTO> = async (req, res, next) => {
    try {
      const userFound = await this._userService.findByID(req.params.id);
      if (!userFound) {
        return this.notFound(res, 'User not found');
      }
      const userUpdated = await this._userService.update(req.params.id, req.body);
      if (!userUpdated) {
        return this.conflict(res, 'Could not update user');
      }
      return this.ok(res, userUpdated);
    }
    catch (error) {
      next(error);
    }
  };

  public uploadUserPhotos: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const userFound = await this._userService.findByID(req.params.id, true);
      if (!userFound) {
        return this.notFound(res, ErrorMessage.NOT_FOUND);
      }
      if (userFound.photos.length === this._maxNumPhotos) {
        return this.conflict(res, ErrorMessage.MAX_NUMBER_OF_PHOTOS_REACHED);
      }
      const incommingImgFiles = req.files as Express.Multer.File[];
      const remainingPhotos: number = this._maxNumPhotos - userFound.photos.length;
      if (incommingImgFiles.length > remainingPhotos) {
        return this.conflict(res, ErrorMessage.MAX_NUMBER_OF_PHOTOS_REACHED);
      }
      const startCount = userFound.photos.length ?? 0;
      const updatedUserPhotos = (
        await this._userService.saveUserPhotos(incommingImgFiles, userFound.id, startCount)
      );
      if (!updatedUserPhotos) {
        return this.conflict(res, ErrorMessage.COULD_NOT_CREATE);
      }
      return this.created(res, updatedUserPhotos);
    }
    catch (error) {
      next(error);
    }
  };

  public updateUserPhoto: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const userFound = await this._userService.findByID(req.params.id, true);
      if (!userFound) {
        return this.notFound(res, ErrorMessage.NOT_FOUND);
      }
      const updatedUserPhoto = (
        await this._userService.updateUserPhoto(userFound.id, req.params.photoId, req.file)
      );
      if (!updatedUserPhoto) {
        return this.conflict(res, ErrorMessage.COULD_NOT_CREATE);
      }
      return this.ok(res, updatedUserPhoto);
    }
    catch (error) {
      next(error);
    }
  };

  public deleteUserById: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const userFound = await this._userService.findByID(req.params.id, true);
      if (!userFound) {
        return this.notFound(res, 'User not found');
      }
      await this._userService.deleteUserById(userFound.id, userFound.photos.map((photo) => photo.id) ?? []);
      return this.noContent(res);
    } catch (error) {
      next(error);
    }
  };

  public deleteUserPhotoById: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const userFound = await this._userService.findByID(req.params.id, true);
      if (!userFound) {
        return this.notFound(res, ErrorMessage.NOT_FOUND);
      }
      const photoToDelete = userFound.photos.find(photo => photo.id === req.params.photoId);
      if (!photoToDelete) {
        return this.conflict(res, ErrorMessage.NOT_FOUND);
      }
      await this._userService.deleteUserPhotoById(userFound.id, photoToDelete);
      return this.noContent(res);
    }
    catch (error) {
      next(error);
    }
  };
}
