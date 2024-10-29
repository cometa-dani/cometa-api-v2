import { PrismaService } from '../config/dataBase';
import { RequestHandler } from 'express';
import * as schemma from './schemma';
import { randomUUID } from 'crypto';
import { bucket } from '../firebase-admin/firebaseAdmin';
import { getDownloadURL } from 'firebase-admin/storage';
import { Organization } from '@prisma/client';
import fs from 'fs/promises';
import Container from 'typedi';


const prismaService = Container.get(PrismaService);

/**
 * Get the latest events with pagination.
 * This function retrieves the latest events from the database with support for pagination.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 *
 * @returns {void}
 */
export const getAllOrganizations: RequestHandler = async (req, res, next) => {
  try {
    const organizations = await prismaService.organization.findMany();

    res.status(200).json(organizations);
  }
  catch (error) {
    next(error);
  }
};


/**
 * Get the latest events with pagination.
 * This function retrieves the latest events from the database with support for pagination.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 *
 * @returns {void}
 */
export const getOrganizationById: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const { id } = req.params;

    const organization = await prismaService.organization.findUnique({
      where: {
        id: +id,
      },
      // include: {
      //   locations: true,
      // }
    });

    res.status(200).json(organization);
  }
  catch (error) {
    next(error);
  }
};


/**
 * @param req {Request<{}, {}, Organization>
 * @param res {Response<Organization>}
 * @param next {NextFunction}
 *
 * @returns {void}
 */
export const createOrganization: RequestHandler = async (req, res, next) => {
  try {
    const organizationBody = schemma.createOrganizationSchemma.safeParse(req.body);

    if (!organizationBody.success) {
      return res.status(400).json({ error: 'Invalid body', issues: organizationBody['error'].issues });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Invalid body', issues: [{ message: 'No file provided' }] });
    }

    const uuidFile = randomUUID();
    const fileUploaded = (
      await
        bucket.upload(
          req.file.path,
          {
            contentType: req.file.mimetype,
            public: true,
            destination: `organizations/${uuidFile}`,
            metadata: {
              firebaseStorageDownloadTokens: uuidFile,
              cacheControl: 'public, max-age=315360000',
              contentType: req.file.mimetype,
            },
          }
        )
    );

    // Delete the file from the local server
    await fs.unlink(req.file.path);

    const organization = await prismaService.organization.create({
      data: {
        ...organizationBody.data as Organization,
        avatarUrl: await getDownloadURL(fileUploaded[0])
      },
    });

    res.status(201).json(organization);
  }
  catch (error) {
    next(error);
  }
};
