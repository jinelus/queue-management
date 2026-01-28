import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
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
import { UpdateServiceService } from '@/domain/master/application/services/service/update-service.service'
import {
  httpServiceSchema,
  PrismaServiceMapper,
} from '@/infra/database/prisma/mappers/prisma-service-mapper'

export const updateServiceBody = z.object({
  isActive: z.boolean().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  avgDurationInt: z.coerce.number().optional(),
})

export class UpdateServiceBodyDto extends createZodDto(updateServiceBody) {}

export const updateServiceParams = z.object({
  organizationId: z.ulid(),
  serviceId: z.ulid(),
})

export class UpdateServiceParamsDto extends createZodDto(updateServiceParams) {}

export const updateServiceResponse = z.object({
  service: httpServiceSchema,
})

export class UpdateServiceResponseDto extends createZodDto(updateServiceResponse) {}

@ApiTags('Services')
@Controller('organizations/:organizationId/services/:serviceId')
@ApiBearerAuth()
@Roles(['admin'])
export class UpdateServiceController {
  constructor(private readonly updateServiceService: UpdateServiceService) {}

  @Put('')
  @ApiOperation({
    summary: 'Update a service',
    description: 'Update the details of a service within an organization.',
  })
  @ZodResponse({
    type: UpdateServiceResponseDto,
    description: 'Successful response with updated service details',
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
    @Body() body: UpdateServiceBodyDto,
    @Param() params: UpdateServiceParamsDto,
  ): Promise<UpdateServiceResponseDto> {
    const currentUserId = session.user.id
    const { isActive, name, description, avgDurationInt } = body
    const { organizationId, serviceId } = params

    const result = await this.updateServiceService.execute({
      serviceId,
      isActive,
      organizationId,
      userId: currentUserId,
      name,
      description,
      avgDurationInt,
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
