import { Router, } from 'express';
import { Container } from 'typedi';
import { authMiddleware } from '../middlewares/authMiddleware';
import { imageUploadMiddleware } from '../middlewares/imageUploadMiddleware';
import { validateRequestMiddleware } from '../middlewares/validateRequestMiddleware';
import { BaseRouter } from '../helpers/baseRouter';
import { UserController } from './user.controller';
import { idsSchemma } from '../shared/dto/baseDTOs';
import { searchQueryParamsSchemma, createUserSchemma, updateUserSchemma, searchByUsernameSchemma } from './user.dto';


class UserRouter extends BaseRouter {
  protected _router = Router();
  protected _userController = Container.get(UserController);

  constructor() {
    super();
  }

  protected _initializeRoutes(): void {
    this._router.get('/search',
      authMiddleware,
      validateRequestMiddleware({ query: searchByUsernameSchemma }),
      this._userController.searchPaginatedUsersByUsername
    );

    this._router.route('/')
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
        validateRequestMiddleware({ params: idsSchemma, body: updateUserSchemma }),
        this._userController.updateUserByID
      );
    /**
     * ******************************************
     * TODO:
     *  urlPram should be userId
     *  ?likes=true,  so we can remove this endpoint
     *  ?friends=true
     * ?targetUser=123
     * ******************************************
     */
    this._router.get('/:uid',
      // authMiddleware,
      validateRequestMiddleware({ params: idsSchemma }),
      this._userController.getloggedInUserWithLikeEvents
    );
    this._router.get('/:uid/targets',
      authMiddleware,
      validateRequestMiddleware({ params: idsSchemma }),
      this._userController.getTargetUserWithFriendship
    );
    /**
     * ******************************************
     * TODO
     * ******************************************
     */

    this._router.post('/:id/photos',
      authMiddleware,
      imageUploadMiddleware.any(),
      validateRequestMiddleware({ params: idsSchemma }),
      this._userController.uploadUserPhotos
    );

    this._router.delete('/:id/photos/:photoId',
      authMiddleware,
      validateRequestMiddleware({ params: idsSchemma }),
      this._userController.deleteUserPhotoById
    );
  }
}


export default new UserRouter().getRouter();
