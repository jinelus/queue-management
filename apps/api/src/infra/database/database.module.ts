import { Module } from "@nestjs/common";
import { EnvModule } from "../env/env.module";
import { PrismaService } from "./prisma/prisma.service";

import { OrganizationRepository } from "@/domain/master/application/repositories/organization.repository";
import { ServiceRepository } from "@/domain/master/application/repositories/service.repository";
import { TicketRepository } from "@/domain/master/application/repositories/ticket.repository";
import { UserRepository } from "@/domain/master/application/repositories/user.repository";
import { ServiceStaffRepository } from "@/domain/master/application/repositories/service-staff.repository";

import { PrismaOrganizationRepository } from "./prisma/repositories/prisma-organization.repository";
import { PrismaServiceRepository } from "./prisma/repositories/prisma-service.repository";
import { PrismaTicketRepository } from "./prisma/repositories/prisma-ticket.repository";
import { PrismaUserRepository } from "./prisma/repositories/prisma-user.repository";
import { PrismaServiceStaffRepository } from "./prisma/repositories/prisma-service-staff.repository";

@Module({
  imports: [EnvModule],
  providers: [
    PrismaService,
    { provide: OrganizationRepository, useClass: PrismaOrganizationRepository },
    { provide: ServiceRepository, useClass: PrismaServiceRepository },
    { provide: TicketRepository, useClass: PrismaTicketRepository },
    { provide: UserRepository, useClass: PrismaUserRepository },
    { provide: ServiceStaffRepository, useClass: PrismaServiceStaffRepository },
  ],
  exports: [
    PrismaService,
    OrganizationRepository,
    ServiceRepository,
    TicketRepository,
    UserRepository,
    ServiceStaffRepository,
  ],
})
export class DatabaseModule {}
