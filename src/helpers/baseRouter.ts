import { Router } from "express";


export abstract class BaseRouter {
  protected abstract _router: Router;

  constructor() {
    this._initializeRoutes();
  }

  protected abstract _initializeRoutes(): void

  public getRouter(): Router {
    return this._router;
  }
}
