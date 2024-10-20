import { NextFunction, Request, Response } from 'express';
import { prisma } from '../dataBaseConnection';
import jwt from 'jsonwebtoken';


export async function authMiddleware(request: Request, response: Response, next: NextFunction) {
  const authHeader = request.headers['authorization'];
  if (!authHeader) {
    return response.status(403).json({
      status: 403,
      message: 'FORBIDDEN'
    });
  }

  const token = String(authHeader).split(' ')[1];
  if (!token) {
    return response.status(403).json({
      status: 403,
      message: 'FORBIDDEN'
    });
  }

  let payload!: string | jwt.JwtPayload;
  try {
    payload = jwt.decode(token);
  }
  catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      // if the error thrown is because the JWT is unauthorized, return a 401 error
      return response.status(401).json({
        status: 401,
        message: e.message
      });
    }
    if (e instanceof jwt.TokenExpiredError) {
      return response.status(401).json({
        message: e.message
      });
    }
    if (e instanceof jwt.NotBeforeError) {
      return response.status(401).json({
        message: e.message
      });
    }
  }
  if (!payload) {
    return response.status(401).json({
      status: 401,
      message: 'UNAUTHORIZED'
    });
  }

  const uid = payload['user_id'];
  const user = await prisma.user.findUnique({ where: { uid } });

  if (!user) {
    return response.status(401).json({
      status: 401,
      message: 'UNAUTHORIZED'
    });
  }

  request.user = user;
  next();
}
