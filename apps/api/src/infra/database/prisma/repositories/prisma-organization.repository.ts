import { Injectable } from "@nestjs/common";
import { OrganizationRepository } from "@/domain/master/application/repositories/organization.repository";
import { Organization } from "@/domain/master/entreprise/entities/organization";
import { PrismaOrganizationMapper } from "../mappers/prisma-organization.mapper";
import { PrismaService } from "../prisma.service";
@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private prisma: PrismaService) {}

  async create(entity: Organization): Promise<void> {
    await this.prisma.organization.create({
      data: PrismaOrganizationMapper.toPrisma(entity),
    });
  }

  async findAll(): Promise<Organization[]> {
    const organizations = await this.prisma.organization.findMany();
    return organizations.map(PrismaOrganizationMapper.toDomain);
  }

  async findById(id: string): Promise<Organization | null> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      return null;
    }

    return PrismaOrganizationMapper.toDomain(organization);
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
    });

    if (!organization) {
      return null;
    }

    return PrismaOrganizationMapper.toDomain(organization);
  }

  async save(entity: Organization): Promise<void> {
    await this.prisma.organization.update({
      where: { id: entity.id.toString() },
      data: PrismaOrganizationMapper.toPrisma(entity),
    });
  }

  async delete(entity: Organization): Promise<void> {
    await this.prisma.organization.delete({
      where: { id: entity.id.toString() },
    });
  }

  async count(): Promise<number> {
    const count = await this.prisma.organization.count();
    return count;
  }
}
