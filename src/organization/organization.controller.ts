import { RequestHandler } from 'express';
import { Service, Container } from 'typedi';
import { BaseController } from '../helpers/baseController';
import { RequestHandlerBody, RequestHandlerParams } from '../helpers/typeRequestHandlers';
import { CreateOrganizationDTO, UpdateOrganizationDTO } from './organizatoin.dto';
import { OrganizationService } from './organization.service';
import { IdsDto } from '../shared/dto/baseDTOs';
import { ErrorMessage } from '../helpers/errorMessages';


@Service()
export class OrganizationController extends BaseController {
  private _organizationService = Container.get(OrganizationService);

  public getAllOrganizations: RequestHandler = async (_, res, next) => {
    try {
      const organizations = await this._organizationService.getOrganizations();
      return this.ok(res, organizations);
    }
    catch (error) {
      next(error);
    }
  };

  public getOrganizationById: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const organization = await this._organizationService.getOrganizationById(req.params.id);
      if (!organization) {
        return this.notFound(res);
      }
      return this.ok(res, organization);
    }
    catch (error) {
      next(error);
    }
  };

  public createOrganization: RequestHandlerBody<CreateOrganizationDTO> = async (req, res, next) => {
    try {
      const organizationExists = await this._organizationService.getUniqueOrganization(req.body.uid);
      if (organizationExists) {
        return this.conflict(res, ErrorMessage.ALREADY_EXISTS);
      }
      const createOrganization = await this._organizationService.createOrganization(req.body);
      return this.created(res, createOrganization);
    }
    catch (error) {
      next(error);
    }
  };

  public uploadOrganizationAvatar: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const organizationExists = await this._organizationService.getOrganizationById(req.params.id);
      if (!organizationExists) {
        return this.notFound(res);
      }
      const organization = await this._organizationService.uploadAvatar(req.params.id, req.file);
      return this.ok(res, organization);
    }
    catch (error) {
      next(error);
    }
  };

  public updateOrganization: RequestHandlerParams<IdsDto, UpdateOrganizationDTO> = async (req, res, next) => {
    try {
      const organizationExists = await this._organizationService.getOrganizationById(req.params.id);
      if (!organizationExists) {
        return this.notFound(res);
      }
      const organization = await this._organizationService.updateOrganization(req.params.id, req.body);
      return this.ok(res, organization);
    }
    catch (error) {
      next(error);
    }
  };

  public deleteOrganization: RequestHandlerParams<IdsDto> = async (req, res, next) => {
    try {
      const organizationExists = await this._organizationService.getOrganizationById(req.params.id);
      if (!organizationExists) {
        return this.notFound(res);
      }
      const organization = await this._organizationService.deleteOrganization(req.params.id);
      return this.ok(res, organization);
    }
    catch (error) {
      next(error);
    }
  };
}
