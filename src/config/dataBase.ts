import { PrismaClient } from '@prisma/client';
import Container, { Token } from 'typedi';


export const PrismaService = new Token<PrismaClient>('PrismaService');
Container.set(PrismaService, new PrismaClient({
  // log: ['query']
}));
