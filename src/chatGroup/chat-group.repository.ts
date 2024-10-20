import { Service } from 'typedi';
import { ChatGroup, User } from '@prisma/client';
import { prisma } from '../config/dataBase';
import { CreateChatGroupDTO } from './chat-group.dto';


interface IChatGroupWithMembers extends ChatGroup {
  members: User[]
}


@Service()
export class ChatGroupRepository {
  private _prisma = prisma;


  async findByID(id: number, loggedInUser: number): Promise<IChatGroupWithMembers | null> {
    const foundChatGroup = await this._prisma.chatGroup.findUnique({
      where: { id },
      include: {
        members: {
          where: { id: { not: loggedInUser } },
          include: { photos: { where: { order: 0 } } }
        }
      }
    });

    return foundChatGroup;
  }


  async create(payload: CreateChatGroupDTO, img: string, adminId: number): Promise<ChatGroup | null> {
    const createdChatGroup = await this._prisma.chatGroup.create({
      data: {
        name: payload.groupName,
        description: '',
        // photo: {
        //   create: {
        //     url: img,
        //     placeholder: '',
        //     uuid: ''
        //   }
        // },
        admin: {
          connect: { id: adminId }
        },
        members: {
          connect: payload.members.map((uid) => ({ uid }))
          // create: payload.members
        }
      }
    });

    return createdChatGroup;
  }
}
