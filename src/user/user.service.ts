import 'reflect-metadata';
import { Service, Container } from 'typedi';
import UserRepository from './user.repository';
import { SearchByQueryParamsDTO, CreateUserDTO, SearchByUsernameDTO, UpdateUserDTO, UserPhotoDTO } from './user.dto';
import { ImageStorageService } from '../shared/imageStorage/image-storage.service';
import { UserPhoto } from '@prisma/client';


@Service()
export class UserService {

  private _userRepository = Container.get(UserRepository);
  private _imageStorageService = Container.get(ImageStorageService);


  async findAll() {
    return this._userRepository.findMany();
  }


  async searchAllByUsername(searchUsersByUsernameDTO: SearchByUsernameDTO, loggedInUserID: number) {
    const { username, limit, cursor } = searchUsersByUsernameDTO;
    return this._userRepository.findManyByUsernameWithPagination(username, limit, cursor, loggedInUserID);
  }


  async findUniqueWithLikeEvents(uuid: string) {
    return this._userRepository.findUniqueUserWithLikedEvents(uuid);
  }


  async findTargetUserWithFriendship(uuid: string, loggedInUserID: number) {
    return this._userRepository.findTargetUserWithFriendship(uuid, loggedInUserID);
  }


  async findUniqueByField(queryParams: SearchByQueryParamsDTO) {
    if (queryParams.email) {
      return this._userRepository.findUniqueByField('email', queryParams.email);
    }
    if (queryParams.username) {
      return this._userRepository.findUniqueByField('username', queryParams.username);
    }
  }


  async findByID(userId: number, includePhotos = false) {
    return this._userRepository.findByID(userId, includePhotos);
  }


  // async findByUUID() { }


  async create(userDto: CreateUserDTO) {
    return this._userRepository.create(userDto);
  }


  async update(userID: number, userDto: UpdateUserDTO) {
    return this._userRepository.update(userID, userDto);
  }


  async uploadPhotos(incommingImgFiles: Express.Multer.File[], userUUID: string): Promise<string[]> {
    const filesToUpload =
      incommingImgFiles.map((file) => {
        const destinationPath = `users/${userUUID}/photos/${file.filename}`;
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


  async updateUserPhotos(userPhotos: UserPhotoDTO[], userID: number) {
    return this._userRepository.updateUserPhotos(userPhotos, userID);
  }


  async deletePhoto(userId: number, photoToDelete: UserPhoto) {
    const destinationPath = `users/${userId}/photos/${photoToDelete.order}`;
    await this._imageStorageService.deleteImage(destinationPath);

    return this._userRepository.deletePhoto(photoToDelete);
  }
}
