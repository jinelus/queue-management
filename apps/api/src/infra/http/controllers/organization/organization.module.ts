import { Module } from '@nestjs/common'
import { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { GetOrganizationBySlugService } from '@/domain/master/application/services/organization/get-organization-by-slug.service'
import { DatabaseModule } from '@/infra/database/database.module'
import { GetOrganizationBySlugController } from './get-organization-by-slug.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [GetOrganizationBySlugController],
  providers: [PermissionFactory, GetOrganizationBySlugService],
})
export class OrganizationModule {}
