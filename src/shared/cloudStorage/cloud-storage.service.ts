import 'reflect-metadata';
import { Service } from 'typedi';
import { ImageHashed, ThumbHash, UploadedPhoto } from './interfaces';
import sharp from 'sharp';
import { bucket } from '../../firebase-admin/firebaseAdmin';


@Service()
export class CloudStorageService {
  private _thumbHash: ThumbHash;
  private _bucket = bucket;

  private async _resizeImage(imageBuffer: Buffer, width = 100, height = 100): Promise<ImageHashed> {
    const image = sharp(imageBuffer).resize(width, height, { fit: 'inside' });
    return await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  }

  public async generatePhotoHashes(imageBuffer: Buffer, width = 100, height = 100): Promise<string> {
    try {
      this._thumbHash = !this._thumbHash ? await import('thumbhash') : this._thumbHash;
      const { data, info } = await this._resizeImage(imageBuffer, width, height);
      const binaryThumbHash = this._thumbHash.rgbaToThumbHash(info?.width, info?.height, data);
      const thumbHashToBase64 = Buffer.from(binaryThumbHash).toString('base64');
      return thumbHashToBase64;
    }
    catch (error) {
      console.log(error);
      return '';
    }
  }

  public async uploadPhotoToBucket(destinationPath: string, imgFile: Express.Multer.File) {
    await this._bucket.file(destinationPath).save(imgFile.buffer, {
      contentType: imgFile.mimetype,
      public: true,
      metadata: {
        firebaseStorageDownloadTokens: imgFile.filename,
        cacheControl: 'public, max-age=315360000',
        contentType: imgFile.mimetype,
      },
    });
    return this._getPublicUrl(destinationPath, imgFile.filename);
  }

  /**
   *
   * @description upload many photos to bucket
   * @param {string} modulePath where to upload
   * @param {Express.Multer.File[]} incommingImgFiles
   * @param {number} startCount
   * @return {UploadedPhoto[]}  where placeholder is base64 string for thumbhash
   */
  public async uploadManyPhotosToBucket(modulePath: string, incommingImgFiles: Express.Multer.File[], startCount: number): Promise<UploadedPhoto[]> {
    const filesToUpload =
      incommingImgFiles.map((file, index) => {
        const destinationPath = `${modulePath}/photos/${startCount + index}`;  // instead of filename should be the order
        return this.uploadPhotoToBucket(destinationPath, file);
      });
    const filesToHash =
      incommingImgFiles.map((file) => {
        return this.generatePhotoHashes(file.buffer);
      });
    const ImageHashed: string[] = await Promise.all(filesToHash);
    const photosUrls: string[] = await Promise.all(filesToUpload);
    const eventPhotosDto: UploadedPhoto[] = incommingImgFiles.map((_, index) => {
      return {
        url: photosUrls[index],
        placeholder: ImageHashed[index],
        order: startCount + index
      };
    });
    return eventPhotosDto;
  }

  public deletePhotoFromBucket(destinationPath: string) {
    return (
      this._bucket.file(destinationPath).delete()
    );
  }

  // return getDownloadURL(this._bucket.file(destinationPath));
  private async _getPublicUrl(destinationPath: string, imgFileName: string) {
    const encodedFileName = encodeURIComponent(destinationPath);
    const url = `https://firebasestorage.googleapis.com/v0/b/${this._bucket.name}/o/${encodedFileName}?alt=media&token=${imgFileName}`;
    return url;
  }
}
