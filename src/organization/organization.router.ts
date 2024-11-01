import { Container } from 'typedi';
import { BaseRouter } from '../helpers/baseRouter';
import { fileUploadMiddleware } from '../middlewares/fileUploadMiddleware';
import { OrganizationController } from './organization.controller';
import { validateRequestMiddleware } from '../middlewares/validateRequestMiddleware';
import { idsSchema } from '../shared/dto/baseDTOs';
import { createOrganizationSchemma, updateOrganizationSchemma } from './organizatoin.dto';
// import { authMiddleware } from '../middlewares/authMiddleware';


class OrganizationRouter extends BaseRouter {
  private _organizationController = Container.get(OrganizationController);

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
        fileUploadMiddleware.single('avatar'),
        this._organizationController.uploadOrganizationAvatar
      );
  }
}

export default new OrganizationRouter().getRouter();
