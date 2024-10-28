import { Container, Service } from 'typedi';
import { CreateEventDto, GetTargetUserEventsDTO, SearchEventsDTO, UpdateEventDto } from './event.dto';
import { RequestHandlerBody, RequestHandlerQuery, RequestHandlerParams } from '../helpers/typeRequestHandlers';
import { EventService } from './event.service';
import { BaseController } from '../helpers/baseController';
import { IdsDto } from '../shared/dto/baseDTOs';
import { ErrorMessage } from '../helpers/errorMessages';


@Service()
export class EventController extends BaseController {

  private _eventService = Container.get(EventService);

  // TODO remove to user folder
  public getUsersWhoLikedSameEventWithPagination: RequestHandlerQuery<GetTargetUserEventsDTO, object, IdsDto> =
    async (req, res, next) => {
      try {
        const { limit, cursor } = req.query;
        const [totalCount, usersList] =
          await this._eventService.getUsersWhoLikedSameEvent(req.params.eventId, req.user.id, req.query);
        // since we are counting down from the latest items in the table,
        // when we reach the first item, we should stop looking for the next cursor.
        const nextCursor = usersList.at(-1)?.id ?? null;
        return this.ok(res, {
          items: cursor > 0 ? usersList.slice(1) : usersList,
          nextCursor,
          totalItems: totalCount,
          hasNextCursor: usersList.length === limit,
          itemsPerPage: limit,
        });
      }
      catch (error) {
        next(error);
      }
    };

  public searchEventsByName: RequestHandlerQuery<SearchEventsDTO> =
    async (req, res, next) => {
      try {
        const { limit = 10, cursor = 0 } = req.query;
        const [events, count] = await this._eventService.searchPaginatedEventsByName(req.query);
        const nextCursor: number = events.at(-1)?.id ?? null;
        const paginatedEvents = {
          items: cursor > 0 ? events.slice(1) : events,
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

  public searchLatestEventsWithPagination: RequestHandlerQuery<SearchEventsDTO> =
    async (req, res, next) => {
      try {
        const { limit = 10, cursor = 0 } = req.query;
        const [events, count] = await this._eventService.searchLatestPaginatedEvents(req.query, req.user.id);
        const nextCursor: number = events?.at(-1)?.id ?? null;
        const paginatedEvents = {
          items: cursor > 0 ? events.slice(1) : events,
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

  public getLikedEventsForBucketListWithPagination: RequestHandlerQuery<GetTargetUserEventsDTO> = async (req, res, next) => {
    try {
      const { limit, cursor, userId: targetUserId } = req.query;
      const [latestLikedEvents, totalEventsCount] = await this._eventService.getLikedEvents(req.user.id, limit, cursor, targetUserId);
      const nextCursor = latestLikedEvents.at(-1)?.id ?? null;
      return this.ok(res, {
        items: cursor > 0 ? latestLikedEvents.slice(1) : latestLikedEvents,
        totalItems: totalEventsCount,
        nextCursor,
        hasNextCursor: latestLikedEvents.length === limit,
        itemsPerPage: limit,
      });
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
