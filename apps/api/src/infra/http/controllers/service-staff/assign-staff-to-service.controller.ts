import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Roles, Session, type UserSession } from '@thallesp/nestjs-better-auth'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import z from 'zod'
import { NotFoundError } from '@/core/errors/not-found-error'
import { AssignStaffToService } from '@/domain/master/application/services/service-staff/assign-staff-to-service.service'
import {
  httpServiceStaffSchema,
  PrismaServiceStaffMapper,
} from '@/infra/database/prisma/mappers/prisma-service-staff.mapper'

export const assignStaffToServiceBody = z.object({
  serviceId: z.ulid(),
  staffId: z.ulid(),
})

export class AssignStaffToServiceBodyDto extends createZodDto(assignStaffToServiceBody) {}

export const assignStaffToServiceParams = z.object({
  organizationId: z.ulid(),
})

export class AssignStaffToServiceParamsDto extends createZodDto(assignStaffToServiceParams) {}

export const assignStaffToServiceResponse = z.object({
  serviceStaff: httpServiceStaffSchema,
})

export class AssignStaffToServiceResponseDto extends createZodDto(assignStaffToServiceResponse) {}

@ApiTags('Service Staff')
@Controller('organizations/:organizationId/service-staff/assign')
@ApiBearerAuth()
@Roles(['admin'])
export class AssignStaffToServiceController {
  constructor(private readonly assignStaffToServiceService: AssignStaffToService) {}

  @Post('')
  @ApiOperation({
    summary: 'Assign staff to a service',
    description: 'Assign a staff member to a service within an organization.',
  })
  @ZodResponse({
    type: AssignStaffToServiceResponseDto,
    description: 'Successful response with created service details',
  })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiParam({
    name: 'organizationId',
    description: 'The unique identifier of the organization',
    type: String,
  })
  async handle(
    @Session() session: UserSession,
    @Body() body: AssignStaffToServiceBodyDto,
    @Param() params: AssignStaffToServiceParamsDto,
  ): Promise<AssignStaffToServiceResponseDto> {
    const currentUserId = session.user.id
    const { serviceId, staffId } = body
    const { organizationId } = params

    const result = await this.assignStaffToServiceService.execute({
      serviceId,
      userId: staffId,
      organizationId,
      actorId: currentUserId,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case NotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { serviceStaff } = result.value

    return {
      serviceStaff: PrismaServiceStaffMapper.toHttp(serviceStaff),
    }
  }
}
