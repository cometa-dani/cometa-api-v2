import { Response } from 'express';


export abstract class BaseController {

  private static jsonResponse(
    res: Response, code: number, message: string
  ) {
    return res.status(code).json({ message });
  }

  protected ok<T>(res: Response, dto?: T) {
    if (dto) {
      res.type('application/json');
      return res.status(200).json(dto);
    }
    else {
      return res.sendStatus(200);
    }
  }

  protected created<T>(res: Response, dto?: T) {
    if (dto) {
      res.type('application/json');
      return res.status(201).json(dto);
    }
    else {
      return res.sendStatus(201);
    }
  }

  protected noContent(res: Response, message?: string) {
    return BaseController.jsonResponse(res, 204, message ? message : 'No content');
  }

  protected badRequest(res: Response, message?: string) {
    return BaseController.jsonResponse(res, 400, message ? message : 'Bad request');
  }

  protected unauthorized(res: Response, message?: string) {
    return BaseController.jsonResponse(res, 401, message ? message : 'Unauthorized');
  }

  protected paymentRequired(res: Response, message?: string) {
    return BaseController.jsonResponse(res, 402, message ? message : 'Payment required');
  }

  protected forbidden(res: Response, message?: string) {
    return BaseController.jsonResponse(res, 403, message ? message : 'Forbidden');
  }

  protected notFound(res: Response, message?: string) {
    return BaseController.jsonResponse(res, 404, message ? message : 'Not found');
  }

  protected conflict(res: Response, message?: string) {
    return BaseController.jsonResponse(res, 409, message ? message : 'Conflict');
  }

  protected tooMany(res: Response, message?: string) {
    return BaseController.jsonResponse(res, 429, message ? message : 'Too many requests');
  }

  protected notImplmentedYet(res: Response) {
    return BaseController.jsonResponse(res, 400, 'TODO');
  }

  protected fail(res: Response, error: Error | string) {
    return res.status(500).json({
      message: error.toString()
    });
  }
}
