import { Service } from 'typedi';
import { ImageHashed, ThumbHash, IUploadedPhoto, IPhotoToUpload } from './interfaces';
import sharp from 'sharp';
import { supabase } from '../../../supabase/config';
import { supabaseUrl } from '../../../vars';


@Service()
export class StorageService {
  private _thumbHash?: ThumbHash;
  private _storage = supabase.storage;
  private _CACHE_CONTROL_MAX_AGE = 315360000;

  private async _resizeImage(imageBuffer: Buffer, width = 100, height = 100): Promise<ImageHashed> {
    const image = sharp(imageBuffer).resize(width, height, { fit: 'inside' });
    return await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  }

  public async generatePhotoBlurHashes(imageBuffer: Buffer, width = 100, height = 100): Promise<string> {
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

  public async uploadPhoto(
    destinationPath: string,
    imgFile: Express.Multer.File,
    token: number | string,
    bucket: string,
    upsert = false
  ) {
    const result = await this._storage.from(bucket).upload(
      destinationPath,
      imgFile.buffer,
      {
        cacheControl: `max-age=${this._CACHE_CONTROL_MAX_AGE}`,
        upsert,
        contentType: imgFile.mimetype,
        metadata: {
          token
        }
      });
    if (result.error) {
      throw new Error(result.error.message);
    }
    return (
      this._storage
        .from(bucket)
        .getPublicUrl(destinationPath)?.data?.publicUrl
    );
  }

  public async uploadPhotos(photosToUpload: IPhotoToUpload[], bucket: string): Promise<IUploadedPhoto[]> {
    const filesToUpload = photosToUpload.map(photo => {
      return this.uploadPhoto(photo.destinationPath, photo.file, photo.id, bucket);
    });
    const blurHashes = photosToUpload.map(photo => {
      return this.generatePhotoBlurHashes(photo.file.buffer);
    });
    const bluredHashes: string[] = await Promise.all(blurHashes);
    const photosUrls: string[] = await Promise.all(filesToUpload);
    const uploadedPhotos: IUploadedPhoto[] = photosToUpload.map((photo, index) => {
      return {
        id: photo.id,
        url: photosUrls[index],
        placeholder: bluredHashes[index],
        order: photo.order
      };
    });
    return uploadedPhotos;
  }

  public async deletePhoto(destinationPath: string, bucket: string) {
    const { error, data } = await this._storage.from(bucket).remove([destinationPath]);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  private async _generatePublicUrl(destinationPath: string, token: string | number) {
    const encodedFileName = encodeURIComponent(destinationPath);
    const url = `${supabaseUrl}/storage/v1/object/public/${encodedFileName}?token=${token}`;
    return url;
  }
}
