import multer from 'multer';
import { HttpError } from '../helpers/httpError';


export const acceptedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',       // Bitmap image format
  'image/webp',      // WebP image format
  'image/tiff',      // TIFF image format
  // 'video/mp4',
  // 'video/mpeg',
  // 'video/quicktime',  // QuickTime video format
  // 'video/x-msvideo',  // AVI video format
  // 'video/x-flv',      // Flash video format
  // 'video/webm',       // WebM video format
  // 'video/x-matroska', // MKV video format
  // Add more formats as needed
];


const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // TODO:  req.user.id // create a custom folder for every user

    cb(null, 'uploads/'); // Specify a directory for temporary storage
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original filename
  },
});

export const fileUploadMiddleware = multer({
  storage: diskStorage, // TODO: change to memory storage
  limits: { fileSize: 400_000_000, files: 5 }, // 400 megaBytes max.
  fileFilter:
    /**
     *
     * @description fileFilter Function than prevents to send
     * a not allowed file format to the server.
     */
    (req, file, filter) => {
      if (acceptedMimeTypes.includes(file?.mimetype)) {
        filter(null, true); // continues to next middleware
      }
      else {
        filter(new HttpError(403, 'file format not supported')); // sends an error response
      }
    }
});
