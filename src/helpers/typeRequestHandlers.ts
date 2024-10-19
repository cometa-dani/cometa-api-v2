import { RequestHandler } from 'express';

export type TypedRequestHandlerBody<ReqBody = object, Params = object, ResBody = object,> = RequestHandler<Params, ResBody, ReqBody>;
export type TypedRequestHandlerParams<Params = object, ReqBody = object, ResBody = object> = RequestHandler<Params, ResBody, ReqBody>;
export type TypedRequestHandlerQuery<Query = object, ReqBody = object, Params = object, ResBody = object> = RequestHandler<Params, ResBody, ReqBody, Query>;
