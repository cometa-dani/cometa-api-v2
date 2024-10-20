import { Container, Service } from 'typedi';
import { ChatGroupService } from './chat-group.service';
import { BaseController } from '../helpers/basecontroller';
import { CreateChatGroupDTO } from './chat-group.dto';
import { TypedRequestHandlerBody, TypedRequestHandlerParams } from '../helpers/typeRequestHandlers';


@Service()
class ChatGroupController extends BaseController {
  private _chatGroupService = Container.get(ChatGroupService);

  constructor() {
    super();
  }


  createChatGroup: TypedRequestHandlerBody<CreateChatGroupDTO> = async (req, res, next) => {
    try {
      const created = await this._chatGroupService.createChatGroup(req.body, req.file);
      return this.ok(res, created);
    }
    catch (error) {
      next(error);
    }
  };


  getChatGroupByID: TypedRequestHandlerParams<{ id?: number }> = async (req, res, next) => {
    try {
      const chatGroup = await this._chatGroupService.getChatGroupByID(req.params.id, req.user.id);
      if (chatGroup) {
        return this.ok(res, chatGroup);
      }
      return this.notFound(res);
    }
    catch (error) {
      next(error);
    }
  };
}


const chatGroupController = Container.get(ChatGroupController);

export default chatGroupController;
