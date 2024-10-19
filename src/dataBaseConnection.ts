import { PrismaClient } from '@prisma/client';


export const prisma = new PrismaClient();

// Function to handle database disconnection
export const shutdownDb = async () => {
  await prisma.$disconnect();
};
