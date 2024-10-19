import path from 'path';
import { RequestHandler } from 'express';
import { IFile } from '../interfaces/IFile';
// import * as webp from 'webp-converter';
import { unlink } from 'fs/promises';


// webp.grant_permission();

export const convertImgWebpToPngMiddleware: RequestHandler = async (req, res, next) => {
  const files = req.files as IFile[];

  for (const file of files) {
    const currentFilePath = file.path;
    // Check if the file is a .webp file
    if (currentFilePath.endsWith('.webp')) {
      const newFilePath = `${path.dirname(currentFilePath)}/${path.basename(currentFilePath, '.webp')}.png`;
      try {
        // Convert the .webp file to .png
        // await webp.dwebp(currentFilePath, newFilePath, '-o');

        // Delete the old .webp file
        await unlink(currentFilePath);
        file.path = newFilePath;
        file.mimetype = 'image/png';
        file.originalname = `${path.basename(file.originalname, '.webp')}.png`;
      }
      catch (err) {
        return next(err);
      }
    }
  }

  next();
};
