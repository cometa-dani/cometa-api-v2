import { Router, } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { imageUploadMiddleware } from '../middlewares/imageUploadMiddleware';
import { validateRequestMiddleware } from '../middlewares/validateRequestMiddleware';
import { UserController } from './user.controller';
import { searchQueryParamsSchemma, createUserSchemma, updateUserSchemma, urlParamsSchemma, searchByUsernameSchemma } from './user.dto';
import { Container } from 'typedi';


class UserRouter {
  private _router = Router();
  private _userController = Container.get(UserController);

  constructor() {
    this._initializeRoutes();
  }

  private _initializeRoutes(): void {
    this._router.get('/search',
      authMiddleware,
      validateRequestMiddleware({ query: searchByUsernameSchemma }),
      this._userController.searchAllByUsernameWithPagination
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
        validateRequestMiddleware({ params: urlParamsSchemma, body: updateUserSchemma }),
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
      validateRequestMiddleware({ params: urlParamsSchemma }),
      this._userController.getloggedInUserWithLikeEvents
    );
    this._router.get('/:uid/targets',
      authMiddleware,
      validateRequestMiddleware({ params: urlParamsSchemma }),
      this._userController.getTargetUserWithFriendship
    );
    /**
     * ******************************************
     * TODO
     * ******************************************
     */

    this._router.post('/:id/photos',
      imageUploadMiddleware.any(),
      validateRequestMiddleware({ params: urlParamsSchemma }),
      this._userController.uploadUserPhotos
    );

    this._router.delete('/:id/photos/:photoId',
      validateRequestMiddleware({ params: urlParamsSchemma }),
      this._userController.deleteUserPhotoById
    );
  }

  public getRouter(): Router {
    return this._router;
  }
}


export default new UserRouter().getRouter();
