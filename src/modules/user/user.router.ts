import { Container } from 'typedi';
import { authUserMiddleware } from '../../middlewares/authMiddleware';
import { imageUploadMiddleware } from '../../middlewares/imageUploadMiddleware';
import { validateRequestMiddleware } from '../../middlewares/validateRequestMiddleware';
import { BaseRouter } from '../../helpers/baseRouter';
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

    // 1
    // TODO
    this._router.get('/:uid', //  -> id
      validateRequestMiddleware({ params: idsSchema }),
      this._userController.getLoggedInUserWithLikeEvents
    );

    // 2
    // TODO
    this._router.get('/:uid/targets',  //  -> id
      authUserMiddleware,
      validateRequestMiddleware({ params: idsSchema }),
      this._userController.getTargetUserWithFriendship
    );

    // 3
    //  ?username=@Jhoa
    // ?liked-same-event=8772
    this._router.get('/search',
      authUserMiddleware,
      validateRequestMiddleware({ query: searchByUsernameSchemma }),
      this._userController.searchPaginatedUsersByUsername
    );
    // this._router.route('/search?liked-same-event=8772') // ? liked-same-event=8772
    //   .get(
    //     validateRequestMiddleware({ query: getTargetUserEventsSchemma, params: idsSchema }),
    //     this._eventController.getPaginatedUsersWhoLikedSameEvent
    //   );


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
      imageUploadMiddleware.any(),
      validateRequestMiddleware({ params: idsSchema }),
      this._userController.uploadUserPhotos
    );

    this._router.delete('/:id/photos/:photoId',
      validateRequestMiddleware({ params: idsSchema }),
      this._userController.deleteUserPhotoById
    );
  }
}


export default new UserRouter().getRouter();
