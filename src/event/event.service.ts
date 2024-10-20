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
    return this._eventRepository.searchLatestEventsWithPagination(queryParams, userID);
  }


  async searchEventsByName(searchDto: SearchByNameDto) {
    return this._eventRepository.searchEventsByName(searchDto);
  }


  async uploadPhotos(incommingImgFiles: Express.Multer.File[], userId: number): Promise<string[]> {
    const filesToUpload =
      incommingImgFiles.map((file) => {
        const destinationPath = `events/${userId}/photos/${file.filename}`;
        return this._imageStorageService.uploadPhotos(destinationPath, file);
      });

    return Promise.all(filesToUpload);
  }


  async generatePhotoHashes(incommingImgFiles: Express.Multer.File[]): Promise<string[]> {
    const filesToHash =
      incommingImgFiles.map((file) => {
        return this._imageStorageService.generatePhotoHashes(file.buffer);
      });

    return Promise.all(filesToHash);
  }


  async deletePhoto(userId: number, photoToDelete: EventPhoto) {
    const destinationPath = `users/${userId}/photos/${photoToDelete.order}`;
    await this._imageStorageService.deletePhoto(destinationPath);

    return this._eventRepository.deletePhoto(photoToDelete);
  }
}
