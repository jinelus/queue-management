import { Module } from '@nestjs/common'
import { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { AssignStaffToService } from '@/domain/master/application/services/service-staff/assign-staff-to-service.service'
import { DatabaseModule } from '@/infra/database/database.module'
import { AssignStaffToServiceController } from './assign-staff-to-service.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [AssignStaffToServiceController],
  providers: [PermissionFactory, AssignStaffToService],
})
export class ServiceStaffModule {}
