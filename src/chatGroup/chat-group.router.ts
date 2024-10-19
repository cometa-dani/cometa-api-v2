import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { imageUploadMiddleware } from '../middlewares/imageUploadMiddleware';
import { validateRequestMiddleware } from '../middlewares/validateRequestMiddleware';
import chatGroupController from './chat-group.controller';
import { createChatGroup } from './chat-group.dto';


class ChatGroupRouter {
  private router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .route('/')
      .post(
        authMiddleware,
        imageUploadMiddleware.single('file'),
        validateRequestMiddleware({ body: createChatGroup }),
        chatGroupController.createChatGroup
      );

    this.router
      .route('/:id')
      .get(
        authMiddleware,
        // validateIdParamMiddleware(),
        chatGroupController.getChatGroupByID
      );
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default new ChatGroupRouter().getRouter();
