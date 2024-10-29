import { Router } from "express";
import Container from "typedi";
import { BaseRouter } from "../../helpers/baseRouter";
import { validateRequestMiddleware } from "../../middlewares/validateRequestMiddleware";
import { idsSchemma, paginationSchemma } from "../../shared/dto/baseDTOs";
import { LocationController } from "./location.controller";
import { createLocationSchemma, updateLocationSchemma } from "./location.dto";


class LocationRouter extends BaseRouter {
  protected readonly _router = Router();
  protected readonly _locationController = Container.get(LocationController);

  constructor() {
    super();
  }

  protected _initializeRoutes() {
    this._router.route('/')
      .get(
        validateRequestMiddleware({ query: paginationSchemma, params: idsSchemma }),
        this._locationController.getAll
      )
      .post(
        validateRequestMiddleware({ body: createLocationSchemma }),
        this._locationController.createLocation
      );

    this._router.route('/:locationId')
      .get(
        validateRequestMiddleware({ params: idsSchemma }),
        this._locationController.getById
      )
      .patch(
        validateRequestMiddleware({ body: updateLocationSchemma, params: idsSchemma }),
        this._locationController.updateLocation
      )
      .delete(
        validateRequestMiddleware({ params: idsSchemma }),
        this._locationController.deleteLocation
      );
  }
}

export default new LocationRouter().getRouter();
