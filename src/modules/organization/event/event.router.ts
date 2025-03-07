import { BaseRouter } from "../../../helpers/baseRouter";
import Container from "typedi";
import photoRouter from "./photo/photo.router";
import locationRouter from "./location/location.router";
import { validateRequestMiddleware } from "../../../middlewares/validateRequestMiddleware";
import { idsSchema } from "../../shared/dto/baseDTOs";
import { authOrganizationMiddleware } from "../../../middlewares/authMiddleware";
import { EventController } from "./event.controller";
import { createEventSchemma, updateEventSchemma } from "./event.dto";


class EventRouter extends BaseRouter {
  private _eventController = Container.get(EventController);

  constructor() {
    super();
    this._initializeRoutes();
    this._router.use(photoRouter);
    this._router.use(locationRouter);
  }

  protected _initializeRoutes(): void {
    this._router.use(authOrganizationMiddleware);
    this._router.route('/')
      .post(
        validateRequestMiddleware({ body: createEventSchemma }),
        this._eventController.createEvent
      );

    this._router.route('/:eventId')
      .patch(
        validateRequestMiddleware({ body: updateEventSchemma, params: idsSchema }),
        this._eventController.updateEvent
      )
      .delete(
        validateRequestMiddleware({ params: idsSchema }),
        this._eventController.deleteEvent
      );
  }
}

export default new EventRouter().getRouter();
