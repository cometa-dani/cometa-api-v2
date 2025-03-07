import multer from 'multer';
import { HttpError } from '../helpers/httpError';
import { maxNumPhotosPerUser } from '../vars';


export const imageUploadMiddleware = multer({
  storage: multer.memoryStorage(), // Use memory storage
  limits: {
    fileSize: 400_000_000,
    files: maxNumPhotosPerUser,
    fieldSize: 400_000_000,
  }, // 400 megaBytes max.
  fileFilter:
    /**
     *
     * @description fileFilter Function than prevents to send
     * a not allowed file format to the server.
     */
    (_, file, filter) => {
      if (new RegExp(/image\/*/i).test(file?.mimetype)) {
        filter(null, true); // continues to next middleware
      }
      else {
        filter(new HttpError(403, 'file format not supported')); // sends an error response
      }
    }
});
