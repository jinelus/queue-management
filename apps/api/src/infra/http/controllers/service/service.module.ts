import { Module } from '@nestjs/common'
import { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { CreateServiceService } from '@/domain/master/application/services/service/create-service.service'
import { DeleteServiceService } from '@/domain/master/application/services/service/delete-service.service'
import { GetAllServicesService } from '@/domain/master/application/services/service/get-all-services.service'
import { GetServiceByIdService } from '@/domain/master/application/services/service/get-service-by-id.service'
import { ToggleServiceStatusService } from '@/domain/master/application/services/service/toggle-service-status.service'
import { UpdateServiceService } from '@/domain/master/application/services/service/update-service.service'
import { DatabaseModule } from '@/infra/database/database.module'
import { CreateServiceController } from './create-service.controller'
import { DeleteServiceController } from './delete-service.controller'
import { GetAllServicesController } from './get-all-services.controller'
import { GetServiceByIdController } from './get-service-by-id.controller'
import { ToggleServiceStatusController } from './toggle-service-status.controller'
import { UpdateServiceController } from './update-service.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [
    CreateServiceController,
    DeleteServiceController,
    GetAllServicesController,
    ToggleServiceStatusController,
    UpdateServiceController,
    GetServiceByIdController,
  ],
  providers: [
    PermissionFactory,
    CreateServiceService,
    DeleteServiceService,
    GetAllServicesService,
    ToggleServiceStatusService,
    UpdateServiceService,
    GetServiceByIdService,
  ],
})
export class ServiceModule {}
