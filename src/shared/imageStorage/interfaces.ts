import sharp from 'sharp';


export interface ThumbHash {
  rgbaToThumbHash(w: number, h: number, rgba: ArrayLike<number>): Uint8Array;
  thumbHashToRGBA(hash: ArrayLike<number>): { w: number, h: number, rgba: Uint8Array };
  thumbHashToAverageRGBA(hash: ArrayLike<number>): { r: number, g: number, b: number, a: number };
  thumbHashToApproximateAspectRatio(hash: ArrayLike<number>): number;
  rgbaToDataURL(w: number, h: number, rgba: ArrayLike<number>): string;
  thumbHashToDataURL(hash: ArrayLike<number>): string;
}

export type ImageHashed = {
  data: Buffer;
  info: sharp.OutputInfo;
}
