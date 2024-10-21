import { RequestHandler } from 'express';

export type RequestHandlerBody<ReqBody = object, Params = object, ResBody = object,> = RequestHandler<Params, ResBody, ReqBody>;
export type RequestHandlerParams<Params = object, ReqBody = object, ResBody = object> = RequestHandler<Params, ResBody, ReqBody>;
export type RequestHandlerQuery<Query = object, ReqBody = object, Params = object, ResBody = object> = RequestHandler<Params, ResBody, ReqBody, Query>;
