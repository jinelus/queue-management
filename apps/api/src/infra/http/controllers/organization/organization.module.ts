import { Module } from '@nestjs/common'
import { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { GetOrganizationBySlugService } from '@/domain/master/application/services/organization/get-organization-by-slug.service'
import { GetPublicOrganizationBySlugService } from '@/domain/master/application/services/organization/get-public-organization-by-slug.service'
import { SearchPublicOrganizationsService } from '@/domain/master/application/services/organization/search-public-organizations.service'
import { DatabaseModule } from '@/infra/database/database.module'
import { GetOrganizationBySlugController } from './get-organization-by-slug.controller'
import { GetPublicOrganizationBySlugController } from './get-public-organization-by-slug.controller'
import { SearchPublicOrganizationsController } from './search-public-organizations.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [
    GetOrganizationBySlugController,
    SearchPublicOrganizationsController,
    GetPublicOrganizationBySlugController,
  ],
  providers: [
    PermissionFactory,
    GetOrganizationBySlugService,
    SearchPublicOrganizationsService,
    GetPublicOrganizationBySlugService,
  ],
})
export class OrganizationModule {}
