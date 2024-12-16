import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodSchema } from 'zod';


interface ValidateReqArgs {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema
}

export function validateRequestMiddleware(validateReq: ValidateReqArgs): RequestHandler {
  return function (req: Request, res: Response, next: NextFunction) {
    for (const key in validateReq) {
      const schema = validateReq[key];
      if (schema) {
        const validationResult = schema?.safeParse(req[key]);
        if (!validationResult.success) {
          return (
            res
              .status(400)
              .json({ error: 'Validation failed', issues: validationResult['error'].issues })
          );
        }
        req[key] = validationResult.data;
      }
    }
    next();
  };
}
