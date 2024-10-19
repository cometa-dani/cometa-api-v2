import { Router } from 'express';
import * as controller from './controller';


export const worldCitiesRouter = Router();

worldCitiesRouter
  .route('/')
  .get(controller.getWorlCitiesByName);
