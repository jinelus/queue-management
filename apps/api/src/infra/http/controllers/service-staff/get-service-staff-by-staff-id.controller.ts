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
import { GetServiceStaffByStaffId } from '@/domain/master/application/services/service-staff/get-service-staff-by-staff-id.service'
import {
  httpServiceStaffSchema,
  PrismaServiceStaffMapper,
} from '@/infra/database/prisma/mappers/prisma-service-staff.mapper'

export const getServiceStaffByStaffIdParams = z.object({
  organizationId: z.ulid(),
})

export class GetServiceStaffByStaffIdParamsDto extends createZodDto(
  getServiceStaffByStaffIdParams,
) {}

export const getServiceStaffByStaffIdResponse = z.object({
  servicesStaff: z.array(httpServiceStaffSchema),
})

export class GetServiceStaffByStaffIdResponseDto extends createZodDto(
  getServiceStaffByStaffIdResponse,
) {}

@ApiTags('Service Staff')
@Controller('organizations/:organizationId/by-staff/service-staff')
@ApiBearerAuth()
export class GetServiceStaffByStaffIdController {
  constructor(private readonly getServiceStaffByStaffIdService: GetServiceStaffByStaffId) {}

  @Post('')
  @ApiOperation({
    summary: 'Get service staff by staff ID',
    description:
      'Retrieve service staff members associated with a specific staff ID within an organization.',
  })
  @ZodResponse({
    type: GetServiceStaffByStaffIdResponseDto,
    description: 'Successful response with service staff details',
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
    @Param() params: GetServiceStaffByStaffIdParamsDto,
  ): Promise<GetServiceStaffByStaffIdResponseDto> {
    const currentUserId = session.user.id
    const { organizationId } = params

    const result = await this.getServiceStaffByStaffIdService.execute({
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
