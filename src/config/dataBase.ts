import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';


export const prisma = new PrismaClient();

@Service()
export class PrismaService extends PrismaClient { }
