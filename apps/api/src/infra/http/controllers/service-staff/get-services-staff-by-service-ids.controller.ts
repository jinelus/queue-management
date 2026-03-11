import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import z from 'zod'
import { NotFoundError } from '@/core/errors/not-found-error'
import { GetServicesStaffByServiceIds } from '@/domain/master/application/services/service-staff/get-services-staff-by-service-ids.service'
import {
  httpServiceStaffSchema,
  PrismaServiceStaffMapper,
} from '@/infra/database/prisma/mappers/prisma-service-staff.mapper'
import {
  ApiZodNotFoundResponse,
  ApiZodUnauthorizedResponse,
} from '../../errors/swagger-zod-error.decorator'

export const getServicesStaffByServiceIdsParams = z.object({
  organizationId: z.ulid(),
})

export class GetServicesStaffByServiceIdsParamsDto extends createZodDto(
  getServicesStaffByServiceIdsParams,
) {}

export const getServicesStaffByServiceIdsBody = z.object({
  serviceIds: z.array(z.ulid()),
})

export class GetServicesStaffByServiceIdsBodyDto extends createZodDto(
  getServicesStaffByServiceIdsBody,
) {}

export const getServicesStaffByServiceIdsResponse = z.object({
  servicesStaff: z.array(httpServiceStaffSchema),
})

export class GetServicesStaffByServiceIdsResponseDto extends createZodDto(
  getServicesStaffByServiceIdsResponse,
) {}

@ApiTags('Service Staff')
@Controller('organizations/:organizationId/service-staff/by-service-ids')
@ApiBearerAuth()
export class GetServicesStaffByServiceIdsController {
  constructor(private readonly getServicesStaffByServiceIdsService: GetServicesStaffByServiceIds) {}

  @Post('')
  @ApiOperation({
    summary: 'Get services staff by service IDs',
    description:
      'Retrieve all staff members assigned to multiple services at once within an organization.',
  })
  @ZodResponse({
    status: 200,
    type: GetServicesStaffByServiceIdsResponseDto,
    description: 'Successful response with service staff details',
  })
  @ApiZodNotFoundResponse()
  @ApiZodUnauthorizedResponse()
  @ApiParam({
    name: 'organizationId',
    description: 'The unique identifier of the organization',
    type: String,
  })
  async handle(
    @Session() session: UserSession,
    @Body() body: GetServicesStaffByServiceIdsBodyDto,
    @Param() params: GetServicesStaffByServiceIdsParamsDto,
  ): Promise<GetServicesStaffByServiceIdsResponseDto> {
    const currentUserId = session.user.id
    const { serviceIds } = body
    const { organizationId } = params

    const result = await this.getServicesStaffByServiceIdsService.execute({
      serviceIds,
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
