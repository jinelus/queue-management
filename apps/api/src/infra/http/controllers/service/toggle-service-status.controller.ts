import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
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
import { ToggleServiceStatusService } from '@/domain/master/application/services/service/toggle-service-status.service'
import {
  httpServiceSchema,
  PrismaServiceMapper,
} from '@/infra/database/prisma/mappers/prisma-service-mapper'

export const toggleServiceStatusBody = z.object({
  isActive: z.boolean(),
})

export class ToggleServiceStatusBodyDto extends createZodDto(toggleServiceStatusBody) {}

export const toggleServiceStatusParams = z.object({
  organizationId: z.ulid(),
  serviceId: z.ulid(),
})

export class ToggleServiceStatusParamsDto extends createZodDto(toggleServiceStatusParams) {}

export const toggleServiceStatusResponse = z.object({
  service: httpServiceSchema,
})

export class ToggleServiceStatusResponseDto extends createZodDto(toggleServiceStatusResponse) {}

@ApiTags('Services')
@Controller('organizations/:organizationId/services/:serviceId/toggle-status')
@ApiBearerAuth()
@Roles(['admin'])
export class ToggleServiceStatusController {
  constructor(private readonly toggleServiceStatusService: ToggleServiceStatusService) {}

  @Patch('')
  @ApiOperation({
    summary: 'Toggle the status of a service',
    description: 'Toggle the active status of a service within an organization.',
  })
  @ZodResponse({
    type: ToggleServiceStatusResponseDto,
    description: 'Successful response with toggled service status details',
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
    @Body() body: ToggleServiceStatusBodyDto,
    @Param() params: ToggleServiceStatusParamsDto,
  ): Promise<ToggleServiceStatusResponseDto> {
    const currentUserId = session.user.id
    const { isActive } = body
    const { organizationId, serviceId } = params

    const result = await this.toggleServiceStatusService.execute({
      serviceId,
      isActive,
      organizationId,
      userId: currentUserId,
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

    const { service } = result.value

    return {
      service: PrismaServiceMapper.toHttp(service),
    }
  }
}
