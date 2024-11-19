import { Container, Service } from 'typedi';
import { GetTargetUserEventsDTO, ILikeableEvent, IUsersLikedSameEvent, SearchEventsDTO } from './event.dto';
import { RequestHandlerQuery, RequestHandlerParams } from '../helpers/typeRequestHandlers';
import { EventService } from './event.service';
import { BaseController } from '../helpers/baseController';
import { IdsDto, PaginatedResult } from '../shared/dto/baseDTOs';
import { ErrorMessage } from '../helpers/errorMessages';
import { Event } from '@prisma/client';


@Service()
export class EventController extends BaseController {
  private _eventService = Container.get(EventService);

  // TODO remove to user folder
  public getPaginatedUsersWhoLikedSameEvent: RequestHandlerQuery<GetTargetUserEventsDTO, null, IdsDto> =
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

  public getPaginatedMatchedEventsByTwoUsers: RequestHandlerQuery<GetTargetUserEventsDTO, null, IdsDto> =
    async (req, res, next) => {
      try {
        const { limit } = req.query;
        const [events, count] = (
          await this._eventService.getPaginatedMatchedEventsByTwoUsers(req.user.id, req.params.uid, req.query)
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
        const nextCursor = events.at(-1)?.id ?? null;
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
        return this.notFound(res, ErrorMessage.NOT_FOUND);
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
}
