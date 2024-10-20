import express from 'express';
import * as controller from './controller';
import { fileUploadMiddleware } from '../middlewares/fileUploadMiddleware';


export const organizationRouter = express.Router();

organizationRouter.route('/')
  .get(controller.getAllOrganizations)
  // TODO logoPhoto is not required, so separete the logic
  .post(fileUploadMiddleware.single('logo'), controller.createOrganization);

organizationRouter
  .route('/:id')
  .get(controller.getOrganizationById);
// .put(controller.updateOrganization)
// .delete(controller.deleteOrganization);
