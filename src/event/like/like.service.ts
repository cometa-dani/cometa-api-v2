import { EventLike } from "@prisma/client";
import { PrismaService } from "../../config/dataBase";
import Container, { Service } from "typedi";


@Service()
export class LikeService {
  private readonly _prismaService = Container.get(PrismaService);

  async findUnique(eventId: number, userId: number): Promise<EventLike | null> {
    return this._prismaService.eventLike.findUnique({
      where: {
        eventId_userId: { eventId: eventId, userId }
      }
    });
  }

  async createLike(eventId: number, userId: number,): Promise<EventLike> {
    return this._prismaService.eventLike.create({
      data: {
        userId: userId,
        eventId: eventId
      }
    });
  }

  async deleteLike(id: number): Promise<EventLike> {
    return this._prismaService.eventLike.delete({
      where: { id }
    });
  }
}
