import Container from "typedi";
import { BaseRouter } from "../../../helpers/baseRouter";
import { validateRequestMiddleware } from "../../../middlewares/validateRequestMiddleware";
import { idsSchema, paginationSchema } from "../../../shared/dto/baseDTOs";
import { LocationController } from "./location.controller";
import { createLocationSchemma, updateLocationSchemma } from "./location.dto";


class LocationRouter extends BaseRouter {
  private _locationController = Container.get(LocationController);

  constructor() {
    super();
    this._initializeRoutes();
  }

  protected _initializeRoutes() {
    this._router.route('/:eventId?/locations')
      .get(
        validateRequestMiddleware({ query: paginationSchema, params: idsSchema }),
        this._locationController.getAll
      )
      .post(
        validateRequestMiddleware({ body: createLocationSchemma }),
        this._locationController.createLocation
      );

    this._router.route('/:eventId?/locations/:locationId')
      .get(
        validateRequestMiddleware({ params: idsSchema }),
        this._locationController.getById
      )
      .patch(
        validateRequestMiddleware({ body: updateLocationSchemma, params: idsSchema }),
        this._locationController.updateLocation
      )
      .delete(
        validateRequestMiddleware({ params: idsSchema }),
        this._locationController.deleteLocation
      );
  }
}

export default new LocationRouter().getRouter();
