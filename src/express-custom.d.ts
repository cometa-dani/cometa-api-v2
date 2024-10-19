import { User } from '@prisma/client';


declare global {
  export namespace Express {
    export interface Request {
      user: User;
    }
  }
}
