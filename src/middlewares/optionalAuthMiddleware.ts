import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/dataBase';
import jwt from 'jsonwebtoken';


export async function optionalAuthMiddleware(request: Request, response: Response, next: NextFunction) {
  const authHeader = request.headers['authorization'];
  if (!authHeader) {
    // request.user = null;
    return next();
  }
  const token = String(authHeader).split(' ')[1];
  if (!token) {
    // request.user = null;
    return next();
  }
  let payload!: string | jwt.JwtPayload | null;
  try {
    payload = jwt.decode(token);
  } catch (e) {
    console.log(e);
    // request.user = null;
    return next();
  }
  if (!payload) {
    // request.user = null;
    return next();
  }
  const uid = payload['user_id'];
  const user = await prisma.user.findUnique({ where: { uid } });
  if (!user) {
    // request.user = null;
    return next();
  }
  request.user = user;
  next();
}
