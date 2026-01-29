import { BadRequestException, Controller, NotFoundException, Param, Post } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import z from 'zod'
import { NotFoundError } from '@/core/errors/not-found-error'
import { GetServiceStaffByServiceId } from '@/domain/master/application/services/service-staff/get-service-staff-by-service.service'
import {
  httpServiceStaffSchema,
  PrismaServiceStaffMapper,
} from '@/infra/database/prisma/mappers/prisma-service-staff.mapper'

export const getServiceStaffByServiceIdParams = z.object({
  organizationId: z.ulid(),
  serviceId: z.ulid(),
})

export class GetServiceStaffByServiceIdParamsDto extends createZodDto(
  getServiceStaffByServiceIdParams,
) {}

export const getServiceStaffByServiceIdResponse = z.object({
  servicesStaff: z.array(httpServiceStaffSchema),
})

export class GetServiceStaffByServiceIdResponseDto extends createZodDto(
  getServiceStaffByServiceIdResponse,
) {}

@ApiTags('Service Staff')
@Controller('organizations/:organizationId/services/:serviceId/service-staff')
@ApiBearerAuth()
export class GetServiceStaffByServiceIdController {
  constructor(private readonly getServiceStaffByServiceIdService: GetServiceStaffByServiceId) {}

  @Post('')
  @ApiOperation({
    summary: 'Get service staff by service ID',
    description:
      'Retrieve a list of staff members assigned to a specific service within an organization.',
  })
  @ZodResponse({
    type: GetServiceStaffByServiceIdResponseDto,
    description: 'Successful response with service staff details',
  })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiParam({
    name: 'organizationId',
    description: 'The unique identifier of the organization',
    type: String,
  })
  @ApiParam({
    name: 'serviceId',
    description: 'The unique identifier of the service',
    type: String,
  })
  async handle(
    @Session() session: UserSession,
    @Param() params: GetServiceStaffByServiceIdParamsDto,
  ): Promise<GetServiceStaffByServiceIdResponseDto> {
    const currentUserId = session.user.id
    const { organizationId, serviceId } = params

    const result = await this.getServiceStaffByServiceIdService.execute({
      serviceId,
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

    const { servicesStaff } = result.value

    return {
      servicesStaff: servicesStaff.map(PrismaServiceStaffMapper.toHttp),
    }
  }
}
