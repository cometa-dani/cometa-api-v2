import { PrismaService } from "../../config/dataBase";
import Container, { Service } from "typedi";
import { CreateLocationDto, UpdateLocationDto } from "./location.dto";
import { Location } from "@prisma/client";


@Service()
export class LocationService {
  private _prismaService = Container.get(PrismaService);

  public async findAll(eventId: number): Promise<Location[]> {
    return this._prismaService.location.findMany({ where: { events: { some: { id: eventId } } } });
  }

  public async findByID(id: number): Promise<Location> {
    return this._prismaService.location.findUnique({ where: { id } });
  }

  public async create(locationDto: CreateLocationDto): Promise<Location> {
    const newLocation = await this._prismaService.location.create({
      data: {
        latitude: locationDto.latitude,
        longitude: locationDto.longitude,
        name: locationDto.name,
        description: locationDto.description,
      }
    });
    return newLocation;
  }

  public async update(locationId: number, locationDto: UpdateLocationDto): Promise<Location> {
    return this._prismaService.location.update({
      where: { id: locationId },
      data: locationDto
    });
  }

  public async delete(locationId: number): Promise<Location> {
    return this._prismaService.location.delete({
      where: { id: locationId },
    });
  }
}
