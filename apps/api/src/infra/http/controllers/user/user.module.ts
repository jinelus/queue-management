import { Module } from '@nestjs/common'
import { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { GetEmployeesUsersService } from '@/domain/master/application/services/user/get-employees-users.service'
import { GetUserByIdService } from '@/domain/master/application/services/user/get-user-by-id.service'
import { DatabaseModule } from '@/infra/database/database.module'
import { GetEmployeesUsersController } from './get-employees-users.controller'
import { GetUserByIdController } from './get-user-by-id.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [GetUserByIdController, GetEmployeesUsersController],
  providers: [PermissionFactory, GetUserByIdService, GetEmployeesUsersService],
})
export class UserModule {}
