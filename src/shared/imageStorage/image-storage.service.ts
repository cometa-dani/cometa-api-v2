import 'reflect-metadata';
import { Service } from 'typedi';
import { ImageHashed, ThumbHash } from './interfaces';
import sharp from 'sharp';
import { bucket } from '../../firebase-admin/firebaseAdmin';


@Service()
export class ImageStorageService {
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


  public async uploadPhotos(destinationPath: string, imgFile: Express.Multer.File) {
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


  public deletePhoto(destinationPath: string) {
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
