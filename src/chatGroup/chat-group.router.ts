import { Router } from 'express';
import { authUserMiddleware } from '../middlewares/authMiddleware';
import { imageUploadMiddleware } from '../middlewares/imageUploadMiddleware';
import { validateRequestMiddleware } from '../middlewares/validateRequestMiddleware';
import chatGroupController from './chat-group.controller';
import { createChatGroup, iDParam } from './chat-group.dto';


class ChatGroupRouter {
  private router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .route('/')
      .post(
        authUserMiddleware,
        imageUploadMiddleware.single('file'),
        validateRequestMiddleware({ body: createChatGroup }),
        chatGroupController.createChatGroup
      );

    this.router
      .route('/:id')
      .get(
        authUserMiddleware,
        validateRequestMiddleware({ params: iDParam }),
        chatGroupController.getChatGroupByID
      );
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default new ChatGroupRouter().getRouter();
