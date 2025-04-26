import { RequestHandlerBody, RequestHandlerParams } from "../../../helpers/typeRequestHandlers";
import { BaseController } from "../../../helpers/baseController";
import Container, { Service } from "typedi";
import { IdsDto } from "../../shared/dto/baseDTOs";
import { CreateEventDto, UpdateEventDto } from "./event.dto";
import { EventService } from "./event.service";


@Service()
export class EventController extends BaseController {
  private _eventService = Container.get(EventService);

  getEvents: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const events = await this._eventService.getAllEvents(req.params.organizationId);
      if (!events) {
        return this.notFound(res);
      }
      return this.ok(res, events);
    }
    catch (error) {
      next(error);
    }
  };

  public createEvent: RequestHandlerBody<CreateEventDto> = async (req, res, next) => {
    try {
      const createdEvent = await this._eventService.createEvent(req.body);
      if (!createdEvent) {
        return this.conflict(res);
      }
      return this.created(res, createdEvent);
    }
    catch (error) {
      next(error);
    }
  };

  public updateEvent: RequestHandlerBody<UpdateEventDto, IdsDto> = async (req, res, next) => {
    try {
      const createdEvent = await this._eventService.updateEvent(req.params.eventId, req.body);
      if (!createdEvent) {
        return this.conflict(res);
      }
      return this.ok(res, createdEvent);
    }
    catch (error) {
      next(error);
    }
  };

  public deleteEvent: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const event = await this._eventService.getEventById(req.params.eventId);
      if (!event) {
        return this.notFound(res);
      }
      await this._eventService.deleteEvent(req.params.eventId, event.photos.map((photo) => photo.id));
      return this.noContent(res);
    }
    catch (error) {
      next(error);
    }
  };
}
