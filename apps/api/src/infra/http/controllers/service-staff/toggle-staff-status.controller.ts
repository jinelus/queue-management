import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
  UnauthorizedException,
} from '@nestjs/common'
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
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { ToggleStaffStatusService } from '@/domain/master/application/services/service-staff/toggle-staff-status.service'
import {
  httpServiceStaffSchema,
  PrismaServiceStaffMapper,
} from '@/infra/database/prisma/mappers/prisma-service-staff.mapper'

export const toggleStaffStatusBody = z.object({
  isOnline: z.boolean().optional(),
  isCounterClosed: z.boolean().optional(),
})

export class ToggleStaffStatusBodyDto extends createZodDto(toggleStaffStatusBody) {}

export const toggleStaffStatusParams = z.object({
  organizationId: z.ulid(),
  serviceStaffId: z.ulid(),
})

export class ToggleStaffStatusParamsDto extends createZodDto(toggleStaffStatusParams) {}

export const toggleStaffStatusResponse = z.object({
  serviceStaff: httpServiceStaffSchema,
})

export class ToggleStaffStatusResponseDto extends createZodDto(toggleStaffStatusResponse) {}

@ApiTags('Service Staff')
@Controller('organizations/:organizationId/service-staff/:serviceStaffId/status')
@ApiBearerAuth()
export class ToggleStaffStatusController {
  constructor(private readonly toggleStaffStatusService: ToggleStaffStatusService) {}

  @Patch('')
  @ApiOperation({
    summary: 'Toggle staff online/counter status',
    description: 'Toggle the online status or close counter mode for a staff member assignment.',
  })
  @ZodResponse({
    type: ToggleStaffStatusResponseDto,
    description: 'Successful response with updated service staff details',
  })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiParam({
    name: 'organizationId',
    description: 'The unique identifier of the organization',
    type: String,
  })
  @ApiParam({
    name: 'serviceStaffId',
    description: 'The unique identifier of the service staff assignment',
    type: String,
  })
  async handle(
    @Session() session: UserSession,
    @Body() body: ToggleStaffStatusBodyDto,
    @Param() params: ToggleStaffStatusParamsDto,
  ): Promise<ToggleStaffStatusResponseDto> {
    const actorId = session.user.id
    const { isOnline, isCounterClosed } = body
    const { serviceStaffId, organizationId } = params

    const result = await this.toggleStaffStatusService.execute({
      serviceStaffId,
      actorId,
      isOnline,
      isCounterClosed,
      organizationId,
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

    const { serviceStaff } = result.value

    return {
      serviceStaff: PrismaServiceStaffMapper.toHttp(serviceStaff),
    }
  }
}
