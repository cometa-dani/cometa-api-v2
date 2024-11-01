import { Router } from 'express';
import * as controller from './worldcities.controller';


export const worldCitiesRouter = Router();

worldCitiesRouter
  .route('/')
  .get(controller.getPaginatedWorlCitiesByName);
