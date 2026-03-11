import { Module } from '@nestjs/common'
import { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { AssignStaffToService } from '@/domain/master/application/services/service-staff/assign-staff-to-service.service'
import { GetServiceStaffByServiceId } from '@/domain/master/application/services/service-staff/get-service-staff-by-service.service'
import { GetServiceStaffByStaffId } from '@/domain/master/application/services/service-staff/get-service-staff-by-staff-id.service'
import { GetServicesStaffByServiceIds } from '@/domain/master/application/services/service-staff/get-services-staff-by-service-ids.service'
import { ToggleStaffStatusService } from '@/domain/master/application/services/service-staff/toggle-staff-status.service'
import { UnassignStaffFromService } from '@/domain/master/application/services/service-staff/unassign-staff-from-service.service'
import { DatabaseModule } from '@/infra/database/database.module'
import { AssignStaffToServiceController } from './assign-staff-to-service.controller'
import { GetServiceStaffByServiceIdController } from './get-service-staff-by-service.controller'
import { GetServiceStaffByStaffIdController } from './get-service-staff-by-staff-id.controller'
import { GetServicesStaffByServiceIdsController } from './get-services-staff-by-service-ids.controller'
import { ToggleStaffStatusController } from './toggle-staff-status.controller'
import { UnassignStaffFromServiceController } from './unassign-staff-from-service.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [
    AssignStaffToServiceController,
    GetServiceStaffByServiceIdController,
    GetServiceStaffByStaffIdController,
    GetServicesStaffByServiceIdsController,
    ToggleStaffStatusController,
    UnassignStaffFromServiceController,
  ],
  providers: [
    PermissionFactory,
    AssignStaffToService,
    GetServiceStaffByServiceId,
    GetServiceStaffByStaffId,
    GetServicesStaffByServiceIds,
    ToggleStaffStatusService,
    UnassignStaffFromService,
  ],
})
export class ServiceStaffModule {}
