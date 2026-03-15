import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import z from 'zod'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
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

export const getServicesStaffByServiceIdsQuery = z.object({
  serviceIds: z
    .union([z.array(z.string()), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        return val.split(',')
      }
      return val
    })
    .pipe(z.array(z.string())),
})

export class GetServicesStaffByServiceIdsQueryDto extends createZodDto(
  getServicesStaffByServiceIdsQuery,
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

  @Get('')
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
  @ApiQuery({
    name: 'serviceIds',
    description: 'An array of service IDs to retrieve staff for',
    schema: { type: 'array', items: { type: 'string' } },
    required: true,
  })
  async handle(
    @Session() session: UserSession,
    @Query() query: GetServicesStaffByServiceIdsQueryDto,
    @Param() params: GetServicesStaffByServiceIdsParamsDto,
  ): Promise<GetServicesStaffByServiceIdsResponseDto> {
    const currentUserId = session.user.id
    const { serviceIds } = query
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
        case NotAllowedError:
          throw new UnauthorizedException(error.message)
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
