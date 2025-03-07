import { Container } from 'typedi';
import { BaseRouter } from '../../helpers/baseRouter';
import { imageUploadMiddleware } from '../../middlewares/imageUploadMiddleware';
import { OrganizationController } from './organization.controller';
import { validateRequestMiddleware } from '../../middlewares/validateRequestMiddleware';
import { idsSchema } from '../shared/dto/baseDTOs';
import { createOrganizationSchemma, updateOrganizationSchemma } from './organizatoin.dto';
import eventRouter from './event/event.router';


class OrganizationRouter extends BaseRouter {
  private _organizationController = Container.get(OrganizationController);

  constructor() {
    super();
    this._initializeRoutes();
    this._router.use('/events', eventRouter);
  }

  protected _initializeRoutes(): void {
    this._router.route('/')
      .get(
        this._organizationController.getAllOrganizations
      )
      .post(
        validateRequestMiddleware({ body: createOrganizationSchemma }),
        this._organizationController.createOrganization
      );

    this._router.route('/:id')
      .get(
        validateRequestMiddleware({ params: idsSchema }),
        this._organizationController.getOrganizationById
      )
      .patch(
        validateRequestMiddleware({ body: updateOrganizationSchemma, params: idsSchema }),
        this._organizationController.updateOrganization
      )
      .delete(
        validateRequestMiddleware({ params: idsSchema }),
        this._organizationController.deleteOrganization
      );

    this._router.route('/:id/photos')
      .post(
        validateRequestMiddleware({ params: idsSchema }),
        imageUploadMiddleware.single('avatar'),
        this._organizationController.uploadOrganizationAvatar
      );
  }
}

export default new OrganizationRouter().getRouter();
