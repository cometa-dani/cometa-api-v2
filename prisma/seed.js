const { PrismaClient } = require('@prisma/client');
const { worldCitiesSeed } = require('./seeds/prod/worldCities.seed.js');

const prisma = new PrismaClient();

const seedDataBase = async () => {
  if (process.env?.NODE_ENV === 'development') {
    // await footBallEventsSeed()
  }
  await worldCitiesSeed();
};

if (process.env?.NODE_ENV !== 'production') {
  seedDataBase()
    .then(async () => {
      console.log('[⚡ seeds] run successfully!');
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
