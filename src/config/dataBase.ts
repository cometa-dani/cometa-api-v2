import { PrismaClient } from '@prisma/client';
import Container, { Token } from 'typedi';


export const prisma = new PrismaClient();

export const PrismaService = new Token<PrismaClient>('PrismaService');
Container.set(PrismaService, prisma);
