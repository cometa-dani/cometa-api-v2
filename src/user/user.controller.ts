import 'reflect-metadata';
import { Service, Container } from 'typedi';
import { BaseController } from '../helpers/basecontroller';
import { RequestHandlerBody, RequestHandlerParams, RequestHandlerQuery } from '../helpers/typeRequestHandlers';
import { UserService } from './user.service';
import { SearchByQueryParamsDTO, CreateUserDTO, SearchByUsernameDTO, UpdateUserDTO, UrlParamsDTO } from './user.dto';
import { RequestHandler } from 'express';


@Service()
export class UserController extends BaseController {
  private _userService = Container.get(UserService);
  private _maxNumPhotos = 5;

  constructor() {
    super();
  }

  public getAllUsers: RequestHandler = async (req, res, next) => {
    try {
      const users = await this._userService.findAll();
      return this.ok(res, users);
    }
    catch (error) {
      next(error);
    }
  };

  public searchAllByUsernameWithPagination: RequestHandlerQuery<SearchByUsernameDTO> = async (req, res, next) => {
    try {
      const { cursor = 0, limit = 10 } = req.query;
      const [users, count] = await this._userService.searchAllByUsername(req.query, req.user.id);
      const nextCursor = users.at(-1)?.id === 1 ? null : users.at(-1)?.id ?? null;
      const paginatedUsers = {
        users: cursor > 0 ? users.slice(1) : users,
        totalUsers: count,
        nextCursor,
        hasNextCursor: nextCursor !== null || users.length < limit,
        usersPerPage: limit,
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
      return this.badRequest(res, 'No query params provided');
    }
    catch (error) {
      next(error);
    }
  };

  //TODO: specify two different methods for loggedInUser and targetUser
  public getloggedInUserWithLikeEvents: RequestHandlerParams<UrlParamsDTO> = async (req, res, next) => {
    try {
      const userFound = await this._userService.findUniqueWithLikeEvents(req.params.uid); // authMiddleware should be remove
      if (!userFound) {
        return this.notFound(res);
      }
      return this.ok(res, { ...userFound, maxNumPhotos: this._maxNumPhotos });
    }
    catch (error) {
      next(error);
    }
  };

  public getTargetUserWithFriendship: RequestHandlerParams<UrlParamsDTO> = async (req, res, next) => {
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
      const userFound = await this._userService.findUniqueByField({ email: req.body.email });
      if (userFound) {
        return this.conflict(res, 'User already exists');
      }
      const userCreated = await this._userService.create(req.body);
      if (!userCreated) {
        return this.conflict(res, 'Could not create user');
      }
      return this.created(res, userCreated);
    }
    catch (error) {
      next(error);
    }
  };

  public updateUserByID: RequestHandlerParams<UrlParamsDTO, UpdateUserDTO> = async (req, res, next) => {
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
  x;
  public uploadUserPhotos: RequestHandlerParams<UrlParamsDTO> = async (req, res, next) => {
    try {
      const userFound = await this._userService.findByID(req.params.id, true);
      if (!userFound) {
        return this.notFound(res, 'User not found');
      }
      if (userFound.photos.length > this._maxNumPhotos) {
        return this.conflict(res, 'Max number of photos already reached the limit');
      }

      /**
       *
       * ************************************************************
       * TODO: bulk the uploading mulitple images into one single
       * operation
       * ************************************************************
       */
      const incommingImgFiles = req.files as Express.Multer.File[];
      const remainingPhotos: number = this._maxNumPhotos - userFound.photos.length;

      if (incommingImgFiles.length > remainingPhotos) {
        return this.conflict(res, 'Max number of photos exceeds the limit');
      }
      const ImageHashed: string[] = await this._userService.generatePhotoHashes(incommingImgFiles);
      const photosUrls: string[] = await this._userService.uploadPhotos(incommingImgFiles, userFound.uid);
      const userPhotosDto = incommingImgFiles.map((file, index) => {
        return {
          url: photosUrls[index],
          placeholder: ImageHashed[index],
          uuid: file.filename,
          order: userFound.photos.length + index
        };
      });

      const updatedUser = await this._userService.updateUserPhotos(userPhotosDto, userFound.id);
      if (!updatedUser) {
        return this.conflict(res, 'Could not update user photos');
      }
      return this.ok(res, updatedUser);
    }
    catch (error) {
      next(error);
    }
  };

  public deleteUserPhotoById: RequestHandlerParams<UrlParamsDTO> = async (req, res, next) => {
    try {
      const userFound = await this._userService.findByID(req.params.id, true);
      if (!userFound) {
        return this.notFound(res, 'User not found');
      }
      const photoToDelete = userFound.photos.find(photo => photo.order === req.params.id);
      if (!photoToDelete) {
        return this.notFound(res, 'Photo not found');
      }
      await this._userService.deletePhoto(userFound.id, photoToDelete);

      return this.noContent(res);
    }
    catch (error) {
      next(error);
    }
  };
}
