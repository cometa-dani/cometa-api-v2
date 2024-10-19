import { RequestHandler } from 'express';
import { prisma } from '../dataBaseConnection';
import * as schemmaValidation from './validations';


/**
 * Retrieves a list of all users, including their associated data.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const getWorlCitiesByName: RequestHandler = async (req, res, next) => {
  try {
    const queries = schemmaValidation.worlCities.safeParse(req.query);

    if (!queries.success) {
      return res.status(400).json({ error: 'Validation failed', issues: queries['error'].issues });
    }

    const { cityName, cursor, limit } = queries.data;

    const [cities, citiesCount] =
      await Promise.all([
        prisma.worldCities.findMany({
          orderBy: { city: 'asc' },
          take: cursor > 0 ? limit + 1 : limit, // only adds 1 when limit is greater than 0
          cursor: cursor > 0 ? { id: cursor } : undefined, // makes pagination
          where: cityName === '' ? { NOT: { city: '' } }
            : {
              city: { contains: cityName, mode: 'insensitive' }
            }
        }),
        prisma.worldCities.count()
      ]);


    const nextCursor = cities.at(-1)?.id === 1 ? null : cities.at(-1)?.id ?? null;

    res
      .status(200)
      .json({
        cities: cursor > 0 ? cities.slice(1) : cities,
        totalcities: citiesCount,
        nextCursor,
        citiesPerPage: limit,
      });
  }
  catch (error) {
    next(error);
  }
};
