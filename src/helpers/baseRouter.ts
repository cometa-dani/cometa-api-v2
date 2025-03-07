import { Router } from "express";


export abstract class BaseRouter {
  protected _router = Router();
  protected abstract _initializeRoutes(): void

  public getRouter(): Router {
    return this._router;
  }
}
