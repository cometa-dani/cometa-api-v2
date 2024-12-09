import Container, { Service } from "typedi";
import { CreateOrganizationDTO, UpdateOrganizationDTO } from "./organizatoin.dto";
import { PrismaService } from "../../config/dataBase";
import { CloudStorageService } from "../shared/cloudStorage/cloud-storage.service";


@Service()
export class OrganizationService {
  private _prismaService = Container.get(PrismaService);
  private _cloudStorageService = Container.get(CloudStorageService);

  public async createOrganization(organization: CreateOrganizationDTO) {
    return this._prismaService.organization.create({
      data: {
        email: organization.email,
        name: organization.name,
        description: organization.description,
        phone: organization.phone,
        uid: organization.uid
      }
    });
  }

  public async getOrganizationById(id: number) {
    return this._prismaService.organization.findUnique({
      where: { id },
      include: { events: true, locations: true }
    });
  }

  public async getUniqueOrganization(uid: string) {
    return this._prismaService.organization.findUnique({
      where: { uid }
    });
  }

  public async getOrganizations() {
    return this._prismaService.organization.findMany();
  }

  public async deleteOrganization(id: number) {
    await this._cloudStorageService.deletePhotoFromBucket(`${id}/avatar`, 'organizations');
    return this._prismaService.organization.delete({
      where: { id }
    });
  }

  public async updateOrganization(id: number, organization: UpdateOrganizationDTO) {
    return this._prismaService.organization.update({
      where: { id },
      data: organization
    });
  }

  public async uploadAvatar(id: number, file: Express.Multer.File) {
    const avatarUrl = await this._cloudStorageService.uploadPhotoToBucket(`${id}/avatar`, file, id, 'organizations');
    return this._prismaService.organization.update({
      where: { id },
      data: {
        avatarUrl
      }
    });
  }
}
