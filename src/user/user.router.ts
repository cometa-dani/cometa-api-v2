import { Container } from 'typedi';
import { authMiddleware } from '../middlewares/authMiddleware';
import { imageUploadMiddleware } from '../middlewares/imageUploadMiddleware';
import { validateRequestMiddleware } from '../middlewares/validateRequestMiddleware';
import { BaseRouter } from '../helpers/baseRouter';
import { UserController } from './user.controller';
import { idsSchema } from '../shared/dto/baseDTOs';
import { searchQueryParamsSchemma, createUserSchemma, updateUserSchemma, searchByUsernameSchemma } from './user.dto';


class UserRouter extends BaseRouter {
  private _userController = Container.get(UserController);

  constructor() {
    super();
    this._initializeRoutes();
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
        validateRequestMiddleware({ params: idsSchema, body: updateUserSchemma }),
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
      validateRequestMiddleware({ params: idsSchema }),
      this._userController.getLoggedInUserWithLikeEvents
    );
    this._router.get('/:uid/targets',
      authMiddleware,
      validateRequestMiddleware({ params: idsSchema }),
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
      validateRequestMiddleware({ params: idsSchema }),
      this._userController.uploadUserPhotos
    );

    this._router.delete('/:id/photos/:photoId',
      authMiddleware,
      validateRequestMiddleware({ params: idsSchema }),
      this._userController.deleteUserPhotoById
    );
  }
}


export default new UserRouter().getRouter();
