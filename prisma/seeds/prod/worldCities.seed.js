// import { PrismaClient } from '@prisma/client';
// import fs from 'fs/promises';
// import Papa from 'papaparse';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs/promises');
const Papa = require('papaparse');
const prisma = new PrismaClient();
const csvFilePath = path.join(__dirname, 'worldcities.csv');


const worldCitiesSeed = async () => {
  const worldCitiesExists = await prisma.worldCities.count();
  if (worldCitiesExists) return;
  try {
    const citiesCsvFile = await fs.readFile(csvFilePath, 'utf8');
    Papa.parse(citiesCsvFile, {
      complete: async (results) => {
        const citiesParsed = results.data.map(row => ({
          city: row[0],
          country: row[1],
        }));

        await prisma.worldCities.createMany({
          data: citiesParsed,
          skipDuplicates: true, // Optional: skips records with duplicate values for unique fields
        });
      },
    });
  }
  catch (error) {
    console.error(error);
  }
};

// export { worldCitiesSeed };
exports.worldCitiesSeed = worldCitiesSeed;
