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
import { CreateServiceService } from '@/domain/master/application/services/service/create-service.service'
import {
  httpServiceSchema,
  PrismaServiceMapper,
} from '@/infra/database/prisma/mappers/prisma-service-mapper'

export const createServiceBody = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  avgDurationInt: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
  maxCapacity: z.coerce.number().optional(),
})

export class CreateServiceBodyDto extends createZodDto(createServiceBody) {}

export const createServiceParams = z.object({
  organizationId: z.ulid(),
})

export class CreateServiceParamsDto extends createZodDto(createServiceParams) {}

export const createServiceResponse = z.object({
  service: httpServiceSchema,
})

export class CreateServiceResponseDto extends createZodDto(createServiceResponse) {}

@ApiTags('Services')
@Controller('organizations/:organizationId/services')
@ApiBearerAuth()
@Roles(['admin'])
export class CreateServiceController {
  constructor(private readonly createServiceService: CreateServiceService) {}

  @Post('')
  @ApiOperation({
    summary: 'Create a new service',
    description: 'Create a new service within an organization.',
  })
  @ZodResponse({
    type: CreateServiceResponseDto,
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
    @Body() body: CreateServiceBodyDto,
    @Param() params: CreateServiceParamsDto,
  ): Promise<CreateServiceResponseDto> {
    const currentUserId = session.user.id
    const { name, description, avgDurationInt, isActive, maxCapacity } = body
    const { organizationId } = params

    const result = await this.createServiceService.execute({
      name,
      description,
      avgDurationInt,
      isActive,
      organizationId,
      userId: currentUserId,
      maxCapacity,
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
