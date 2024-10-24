import { Service, Container } from 'typedi';
import { EventRepository } from './event.repository';
import { EventsByQueryParamsDTO, SearchByNameDto, SearchEventsByQueryParamsDTO } from './event.dto';
import { ImageStorageService } from '../shared/imageStorage/image-storage.service';
import { EventPhoto } from '@prisma/client';


@Service()
export class EventService {

  private _eventRepository = Container.get(EventRepository);
  private _imageStorageService = Container.get(ImageStorageService);


  async getUsersWhoLikedSameEvent(eventID: number, loggedInUserID: number, queryParams: EventsByQueryParamsDTO) {
    return this._eventRepository.getUsersWhoLikedSameEvent(eventID, loggedInUserID, queryParams);
  }


  async searchLatestEventsWithPagination(queryParams: SearchEventsByQueryParamsDTO, userID: number) {
    return this._eventRepository.searchLastestEventsWithPagination(queryParams, userID);
  }


  async searchEventsByName(searchDto: SearchByNameDto) {
    return this._eventRepository.searchEventsByName(searchDto);
  }


  async uploadPhotos(incommingImgFiles: Express.Multer.File[], userUUID: string): Promise<string[]> {
    const filesToUpload =
      incommingImgFiles.map((file) => {
        const destinationPath = `events/${userUUID}/photos/${file.filename}`;
        return this._imageStorageService.uploadImage(destinationPath, file);
      });

    return Promise.all(filesToUpload);
  }


  async generatePhotoHashes(incommingImgFiles: Express.Multer.File[]): Promise<string[]> {
    const filesToHash =
      incommingImgFiles.map((file) => {
        return this._imageStorageService.generateImageHash(file.buffer);
      });

    return Promise.all(filesToHash);
  }


  async deletePhoto(userUUID: string, photoToDelete: EventPhoto) {
    const destinationPath = `users/${userUUID}/photos/${photoToDelete.uuid}`;
    await this._imageStorageService.deleteImage(destinationPath);

    return this._eventRepository.deletePhoto(photoToDelete);
  }
}
