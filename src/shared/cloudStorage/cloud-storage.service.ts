import 'reflect-metadata';
import { Service } from 'typedi';
import { ImageHashed, ThumbHash, IUploadedPhoto, IPhotoToUpload } from './interfaces';
import sharp from 'sharp';
import { bucket } from '../../firebase-admin/firebaseAdmin';


@Service()
export class CloudStorageService {
  private _thumbHash?: ThumbHash;
  private _bucket = bucket;
  private _env = process.env.NODE_ENV;

  private async _resizeImage(imageBuffer: Buffer, width = 100, height = 100): Promise<ImageHashed> {
    const image = sharp(imageBuffer).resize(width, height, { fit: 'inside' });
    return await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  }

  public async generatePhotoHashes(imageBuffer: Buffer, width = 100, height = 100): Promise<string> {
    try {
      if (!this._thumbHash) {
        this._thumbHash = await import('thumbhash');
      }
      const { data, info } = await this._resizeImage(imageBuffer, width, height);
      const binaryThumbHash = this._thumbHash.rgbaToThumbHash(info?.width, info?.height, data);
      const thumbHashToBase64 = Buffer.from(binaryThumbHash).toString('base64');
      return thumbHashToBase64;
    }
    catch {
      return '';
    }
  }

  public async uploadPhotoToBucket(
    destinationPath: string,
    imgFile: Express.Multer.File,
    imgId?: number | string
  ) {
    const token = imgId ? imgId.toString() : imgFile.filename;
    const path = this._env !== 'production' ? 'test/' + destinationPath : destinationPath;
    await this._bucket.file(path).save(imgFile.buffer, {
      contentType: imgFile.mimetype,
      public: true,
      metadata: {
        firebaseStorageDownloadTokens: token,
        cacheControl: 'public, max-age=315360000',
        contentType: imgFile.mimetype,
      },
    });
    return this._generatePublicUrl(path, token);
  }

  public async uploadPhotosToBucket(photosToUpload: IPhotoToUpload[]): Promise<IUploadedPhoto[]> {
    const filesToUpload = photosToUpload.map(photo => {
      return this.uploadPhotoToBucket(photo.destinationPath, photo.file, photo.id);
    });
    const filesToHash = photosToUpload.map(photo => {
      return this.generatePhotoHashes(photo.file.buffer);
    });
    const ImageHashed: string[] = await Promise.all(filesToHash);
    const photosUrls: string[] = await Promise.all(filesToUpload);
    const uploadedPhotos: IUploadedPhoto[] = photosToUpload.map((photo, index) => {
      return {
        id: photo.id,
        url: photosUrls[index],
        placeholder: ImageHashed[index],
        order: photo.order
      };
    });
    return uploadedPhotos;
  }

  public deletePhotoFromBucket(destinationPath: string) {
    return (
      this._bucket.file(destinationPath).delete()
    );
  }

  // return getDownloadURL(this._bucket.file(destinationPath));
  private async _generatePublicUrl(destinationPath: string, imgFileName: string) {
    const encodedFileName = encodeURIComponent(destinationPath);
    const url = `https://firebasestorage.googleapis.com/v0/b/${this._bucket.name}/o/${encodedFileName}?alt=media&token=${imgFileName}`;
    return url;
  }
}
