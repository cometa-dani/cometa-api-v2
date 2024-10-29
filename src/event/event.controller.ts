import { Container, Service } from 'typedi';
import { CreateEventDto, GetTargetUserEventsDTO, ILikeableEvent, IUsersLikedSameEvent, SearchEventsDTO, UpdateEventDto } from './event.dto';
import { RequestHandlerBody, RequestHandlerQuery, RequestHandlerParams } from '../helpers/typeRequestHandlers';
import { EventService } from './event.service';
import { BaseController } from '../helpers/baseController';
import { IdsDto, PaginatedResult } from '../shared/dto/baseDTOs';
import { ErrorMessage } from '../helpers/errorMessages';
import { Event } from '@prisma/client';


@Service()
export class EventController extends BaseController {

  private _eventService = Container.get(EventService);

  // TODO remove to user folder
  public getPaginatedUsersWhoLikedSameEvent: RequestHandlerQuery<GetTargetUserEventsDTO, object, IdsDto> =
    async (req, res, next) => {
      try {
        const { limit } = req.query;
        const [users, totalCount] = (
          await this._eventService.getUsersWhoLikedSameEvent(req.params.eventId, req.user.id, req.query)
        );
        const nextCursor = users.at(-1)?.id ?? null;
        const paginatedUsers: PaginatedResult<IUsersLikedSameEvent> = {
          items: users,
          nextCursor,
          totalItems: totalCount,
          hasNextCursor: users.length === limit,
          itemsPerPage: limit,
        };
        return this.ok(res, paginatedUsers);
      }
      catch (error) {
        next(error);
      }
    };

  public getPaginatedMatchedEventsByTwoUsers: RequestHandlerQuery<GetTargetUserEventsDTO, object, IdsDto> =
    async (req, res, next) => {
      try {
        const { limit } = req.query;
        const [events, count] = (
          await this._eventService.getPaginatedMatchedEventsByTwoUsers(req.user.id, req.params.id, req.query)
        );
        const nextCursor = events.at(-1)?.id ?? null;
        const paginatedEvents: PaginatedResult<ILikeableEvent> = {
          items: events,
          totalItems: count,
          nextCursor,
          hasNextCursor: events.length === limit,
          itemsPerPage: limit,
        };
        return this.ok(res, paginatedEvents);
      }
      catch (error) {
        next(error);
      }
    };

  public searchPaginatedEventsByName: RequestHandlerQuery<SearchEventsDTO> =
    async (req, res, next) => {
      try {
        const { limit } = req.query;
        const [events, count] = await this._eventService.searchPaginatedEventsByName(req.query);
        const nextCursor: number = events.at(-1)?.id ?? null;
        const paginatedEvents: PaginatedResult<Event> = {
          items: events,
          totalItems: count,
          nextCursor,
          hasNextCursor: events.length === limit,
          itemsPerPage: limit,
        };
        return this.ok(res, paginatedEvents);
      }
      catch (error) {
        next(error);
      }
    };

  public getPaginatedLatestEvent: RequestHandlerQuery<SearchEventsDTO> =
    async (req, res, next) => {
      try {
        const { limit } = req.query;
        const [events, count] = (
          await this._eventService.getPaginatedLatestEvents(req.query, req.user.id)
        );
        const nextCursor: number = events?.at(-1)?.id ?? null;
        const paginatedEvents: PaginatedResult<ILikeableEvent> = {
          items: events,
          totalItems: count,
          nextCursor,
          hasNextCursor: events.length === limit,
          itemsPerPage: limit,
        };
        return this.ok(res, paginatedEvents);
      }
      catch (error) {
        next(error);
      }
    };

  public getEventByID: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const foundEvent = await this._eventService.getEventById(req.params.eventId);
      if (!foundEvent) {
        return this.notFound(res, ErrorMessage.EVENT_NOT_FOUND);
      }
      return this.ok(res, foundEvent);
    }
    catch (error) {
      next(error);
    }
  };

  public getPaginatedLikedEventsForBucketList: RequestHandlerQuery<GetTargetUserEventsDTO> =
    async (req, res, next) => {
      try {
        const { limit } = req.query;
        const [events, count] = (
          await this._eventService.getPaginatedLikedEvents(req.user.id, req.query)
        );
        const nextCursor = events.at(-1)?.id ?? null;
        const paginatedEvents: PaginatedResult<ILikeableEvent> = {
          items: events,
          totalItems: count,
          nextCursor,
          hasNextCursor: events.length === limit,
          itemsPerPage: limit,
        };
        return this.ok(res, paginatedEvents);
      }
      catch (error) {
        next(error);
      }
    };

  public createEvent: RequestHandlerBody<CreateEventDto> = async (req, res, next) => {
    try {
      const createdEvent = await this._eventService.createEvent(req.body);
      if (!createdEvent) {
        return this.conflict(res, ErrorMessage.COULD_NOT_CREATE_EVENT);
      }
      return this.ok(res, createdEvent);
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
      const createdEvent = await this._eventService.deleteEvent(req.params.eventId);
      // 2. we should delete images as well
      // 3. should deletes likes, shares and location
      if (!createdEvent) {
        return this.conflict(res);
      }
      return this.noContent(res);
    }
    catch (error) {
      next(error);
    }
  };
}
