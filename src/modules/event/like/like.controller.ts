import { BaseController } from "../../../helpers/baseController";
import { RequestHandlerParams } from "../../../helpers/typeRequestHandlers";
import { IdsDto } from "../../shared/dto/baseDTOs";
import Container, { Service } from "typedi";
import { LikeService } from "./like.service";


@Service()
export class LikeController extends BaseController {
  private _likeService = Container.get(LikeService);

  public createOrDeleteLikeByEvent: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const foundEventLiked = await this._likeService.findUnique(req.params.eventId, req.user.id);
      if (foundEventLiked) {
        await this._likeService.deleteLike(foundEventLiked.id);
        return this.noContent(res);
      }
      const eventLiked = await this._likeService.createLike(req.params.eventId, req.user.id);
      return this.created(res, { eventLiked });
    }
    catch (error) {
      next(error);
    }
  };
}
