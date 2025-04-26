import Container, { Service } from "typedi";
import { BaseController } from "../../../../helpers/baseController";
import { LocationService } from "./location.service";
import { CreateLocationDto, UpdateLocationDto } from "./location.dto";
import { RequestHandlerBody, RequestHandlerParams, RequestHandlerQuery } from "src/helpers/typeRequestHandlers";
import { IdsDto, PaginationDto } from "../../../shared/dto/baseDTOs";


@Service()
export class LocationController extends BaseController {
  private _locationService = Container.get(LocationService);

  public getAll: RequestHandlerQuery<PaginationDto, null, IdsDto> = async (req, res, next) => {
    try {
      const allLocations = await this._locationService.findAll(req.params.organizationId);
      this.ok(res, allLocations);
    }
    catch (error) {
      next(error);
    }
  };

  public getById: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const location = await this._locationService.findByID(req.params.locationId);
      this.ok(res, location);
    }
    catch (error) {
      next(error);
    }
  };

  public createLocation: RequestHandlerBody<CreateLocationDto, IdsDto> = async (req, res, next) => {
    try {
      const newLocation = await this._locationService.create(req.body);
      if (!newLocation) {
        return this.conflict(res);
      }
      return this.created(res, newLocation);
    }
    catch (error) {
      next(error);
    }
  };

  public updateLocation: RequestHandlerBody<UpdateLocationDto, IdsDto> = async (req, res, next) => {
    try {
      const updatedLocation = await this._locationService.update(req.params.locationId, req.body);
      if (!updatedLocation) {
        return this.conflict(res);
      }
      return this.ok(res, updatedLocation);
    }
    catch (error) {
      next(error);
    }
  };

  public deleteLocation: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const deletedLocation = await this._locationService.delete(req.params.locationId);
      if (!deletedLocation) {
        return this.conflict(res);
      }
      return this.noContent(res);
    }
    catch (error) {
      next(error);
    }
  };
}
