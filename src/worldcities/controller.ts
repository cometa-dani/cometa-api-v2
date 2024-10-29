import { RequestHandler } from 'express';
import { PrismaService } from '../config/dataBase';
import * as schemmaValidation from './schemma';
import Container from 'typedi';
import { configCursorBasedPagination } from '../helpers/configCursor';
import { PaginatedResult } from '../shared/dto/baseDTOs';
import { WorldCities } from '@prisma/client';


/**
 * Retrieves a list of all users, including their associated data.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const getPaginatedWorlCitiesByName: RequestHandler = async (req, res, next) => {
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
          ...configCursorBasedPagination(limit, cursor), // makes pagination
          where: cityName === '' ? { NOT: { city: '' } }
            : {
              city: { contains: cityName, mode: 'insensitive' }
            }
        }),
        prismaService.worldCities.count()
      ]);
    const nextCursor = cities.at(-1)?.id ?? null;
    const paginatedCities: PaginatedResult<WorldCities> = {
      items: cities,
      totalItems: citiesCount,
      nextCursor,
      hasNextCursor: cities.length === limit,
      itemsPerPage: limit,
    };

    return res.status(200).json(paginatedCities);
  }
  catch (error) {
    next(error);
  }
};
