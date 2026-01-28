import { BadRequestException, Controller, Get, NotFoundException, Param } from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import z from 'zod'
import { NotFoundError } from '@/core/errors/not-found-error'
import { GetServiceByIdService } from '@/domain/master/application/services/service/get-service-by-id.service'
import {
  httpServiceSchema,
  PrismaServiceMapper,
} from '@/infra/database/prisma/mappers/prisma-service-mapper'

export const getServiceByIdParams = z.object({
  organizationId: z.ulid(),
  serviceId: z.ulid(),
})

export class GetServiceByIdParamsDto extends createZodDto(getServiceByIdParams) {}

export const getServiceByIdResponse = z.object({
  service: httpServiceSchema,
})

export class GetServiceByIdResponseDto extends createZodDto(getServiceByIdResponse) {}

@ApiTags('Services')
@Controller('organizations/:organizationId/services/by-id/:serviceId')
@AllowAnonymous()
export class GetServiceByIdController {
  constructor(private readonly getServiceByIdService: GetServiceByIdService) {}

  @Get('')
  @ApiOperation({
    summary: 'Get all services',
    description: 'Retrieve all services within an organization.',
  })
  @ZodResponse({
    type: GetServiceByIdResponseDto,
    description: 'Successful response with all services details',
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
  async handle(@Param() params: GetServiceByIdParamsDto): Promise<GetServiceByIdResponseDto> {
    const { organizationId, serviceId } = params

    const result = await this.getServiceByIdService.execute({
      organizationId,
      serviceId,
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
