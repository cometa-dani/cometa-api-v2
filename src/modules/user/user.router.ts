import {
  searchQueryParamsSchemma,
  createUserSchemma,
  updateUserSchemma,
  searchByUsernameSchemma,
  getTargetUserEventsSchemma
} from './user.dto';
import { Container } from 'typedi';
import { authUserMiddleware } from '../../middlewares/authMiddleware';
import { imageUploadMiddleware } from '../../middlewares/imageUploadMiddleware';
import { validateRequestMiddleware } from '../../middlewares/validateRequestMiddleware';
import { BaseRouter } from '../../helpers/baseRouter';
import { UserController } from './user.controller';
import { idsSchema } from '../shared/dto/baseDTOs';
import { Router } from 'express';


class UserRouter extends BaseRouter {
  private _userController = Container.get(UserController);

  constructor() {
    super();
    this._router = Router();
    this._initializeRoutes();
  }

  protected _initializeRoutes(): void {

    // 3
    //  ?username=@Jhoa
    this._router.route('/search')
      .get(
        authUserMiddleware,
        validateRequestMiddleware({ query: searchByUsernameSchemma }),
        this._userController.searchPaginatedUsersByUsername
      );
    this._router.route('/liked-same-event')
      .get(
        authUserMiddleware,
        validateRequestMiddleware({ query: getTargetUserEventsSchemma }),
        this._userController.getPaginatedUsersWhoLikedSameEvent
      );

    // 4
    this._router.route('/') // ?email=Jhoa%40gmail.com &username=@Jhoa
      .get(
        validateRequestMiddleware({ query: searchQueryParamsSchemma }),
        this._userController.findUniqueUserByQueryParams
      )
      .post(
        validateRequestMiddleware({ body: createUserSchemma }),
        this._userController.createUser
      );

    this._router.route('/:id')
      .patch(
        validateRequestMiddleware({ params: idsSchema, body: updateUserSchemma }),
        this._userController.updateUserByID
      )
      .delete(
        validateRequestMiddleware({ params: idsSchema, }),
        this._userController.deleteUserById
      );

    this._router.post('/:id/photos',
      imageUploadMiddleware.array('files'),
      validateRequestMiddleware({ params: idsSchema }),
      this._userController.uploadUserPhotos
    );

    this._router.patch('/:id/photos/:photoId',
      imageUploadMiddleware.single('file'),
      validateRequestMiddleware({ params: idsSchema }),
      this._userController.updateUserPhoto
    );

    this._router.route('/:id/photos/:photoId')
      .delete(
        validateRequestMiddleware({ params: idsSchema }),
        this._userController.deleteUserPhotoById
      );

    // 1
    // TODO
    this._router.route('/:uid')
      .get( //  -> id
        validateRequestMiddleware({ params: idsSchema }),
        this._userController.getUserProfile
      );

    // 2
    // TODO
    this._router.route('/:uid/targets')
      .get(  //  -> id
        authUserMiddleware,
        validateRequestMiddleware({ params: idsSchema }),
        this._userController.getTargetUserWithFriendship
      );

  }
}


export default new UserRouter().getRouter();
