/* eslint-disable @typescript-eslint/no-unused-vars */
import { Service, Container } from 'typedi';
import { ImageStorageService } from '../shared/imageStorage/image-storage.service';
import { ChatGroupRepository } from './chat-group.repository';
import { CreateChatGroupDTO } from './chat-group.dto';


@Service()
export class ChatGroupService {
  private _imageUploadService = Container.get(ImageStorageService);
  private _chatGroupRepository = Container.get(ChatGroupRepository);

  async createChatGroup(body: CreateChatGroupDTO, imgfile: Express.Multer.File) {
    // create chatGroup
    this._chatGroupRepository.create(body, '', 1);
    const imageHash = await this._imageUploadService.generatePhotoHashes(imgfile.buffer, 200, 200);
    const imageDestinationPath = `chatGroups/${'chatGroupUUID'}/photos/${imgfile.filename}`;
    const imageUpload = await this._imageUploadService.uploadPhotos('', imgfile);
    // 3. create image register in DB, and connect that image with the chatGroup ID
    // return the updated chatGroup with the image url and placeholder
    return;
  }

  async getChatGroupByID(id: number, loggedInUserID: number) {
    return this._chatGroupRepository.findByID(id, loggedInUserID);
    // try {
    // const catGroupID = req.params?.id;

    // const chatGroup = await prisma.chatGroup.findUnique({
    //   where: { id: catGroupID },
    //   include: {
    //     members: {
    //       where: { id: { not: req.user.id } },
    //       include: { photos: { where: { order: 0 } } }
    //     }
    //   }
    // });

    // if (!chatGroup) {
    //   return res.status(404).json({ error: 'Chat group not found' });
    // }

    // const chatGroupData = {
    //   ...chatGroup,
    //   members: chatGroup.members.reduce((prev, member) => ({
    //     ...prev,
    //     [member.uid]: member
    //   })
    //     , new Object()
    //   )
    // };
    // return chatGroupData;
    // return (
    //   res
    //     .status(200)
    //     .json(chatGroupData)
    // );
  }
}
