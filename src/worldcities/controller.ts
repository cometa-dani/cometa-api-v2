import { RequestHandler } from 'express';
import { PrismaService } from '../config/dataBase';
import * as schemmaValidation from './validations';
import Container from 'typedi';


/**
 * Retrieves a list of all users, including their associated data.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const getWorlCitiesByName: RequestHandler = async (req, res, next) => {
  try {
    const prismaService = Container.get(PrismaService);
    const queries = schemmaValidation.getWorlCitiesSchemma.safeParse(req.query);
    if (!queries.success) {
      return res.status(400).json({ error: 'Validation failed', issues: queries['error'].issues });
    }
    const { cityName, cursor, limit } = queries.data;

    const [cities, citiesCount] =
      await Promise.all([
        prismaService.worldCities.findMany({
          orderBy: { city: 'asc' },
          take: cursor > 0 ? limit + 1 : limit, // only adds 1 when limit is greater than 0
          cursor: cursor > 0 ? { id: cursor } : undefined, // makes pagination
          where: cityName === '' ? { NOT: { city: '' } }
            : {
              city: { contains: cityName, mode: 'insensitive' }
            }
        }),
        prismaService.worldCities.count()
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
