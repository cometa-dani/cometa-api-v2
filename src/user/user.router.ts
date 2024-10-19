import { Router, } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { imageUploadMiddleware } from '../middlewares/imageUploadMiddleware';
import { validateRequestMiddleware } from '../middlewares/validateRequestMiddleware';
import { UserController } from './user.controller';
import { schemmaSearchQueryParams, schemmaCreateUser, schemmaUpdateUser, schemmaUrlParams, schemmaSearchByUsername } from './user.dto';
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
      validateRequestMiddleware({ query: schemmaSearchByUsername }),
      this._userController.searchAllByUsernameWithPagination
    );


    this._router.route('/')
      .get(
        validateRequestMiddleware({ query: schemmaSearchQueryParams }),
        this._userController.findUniqueUserByQueryParams
      )
      .post(
        validateRequestMiddleware({ body: schemmaCreateUser }),
        this._userController.createUser
      );


    this._router.patch('/:id',
      validateRequestMiddleware({ params: schemmaUrlParams, body: schemmaUpdateUser }),
      this._userController.updateUserByID
    );


    this._router.post('/:id/photos',
      imageUploadMiddleware.any(),
      validateRequestMiddleware({ params: schemmaUrlParams }),
      this._userController.uploadUserPhotos
    );


    this._router.delete('/:id/photos/:uid',
      imageUploadMiddleware.any(),
      validateRequestMiddleware({ params: schemmaUrlParams }),
      this._userController.deleteUserPhotoById
    );

    // ********************************************
    // TODO:
    // there is difference between getting loggedInUser info and targetUser info
    // ********************************************
    this._router.get('/:uid',
      validateRequestMiddleware({ params: schemmaUrlParams }),
      this._userController.getloggedInUserWithLikeEvents
    );


    this._router.get('/:uid/targets',
      authMiddleware,
      validateRequestMiddleware({ params: schemmaUrlParams }),
      this._userController.getTargetUserWithFriendship
    );
  }


  public getRouter(): Router {
    return this._router;
  }
}


export default new UserRouter().getRouter();
