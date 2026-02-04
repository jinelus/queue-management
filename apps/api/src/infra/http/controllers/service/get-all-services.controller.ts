import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import z from 'zod'
import { NotFoundError } from '@/core/errors/not-found-error'
import { GetAllServicesService } from '@/domain/master/application/services/service/get-all-services.service'
import {
  httpServiceSchema,
  PrismaServiceMapper,
} from '@/infra/database/prisma/mappers/prisma-service-mapper'

export const getAllServicesQuery = z.object({
  page: z.coerce.number().optional(),
  perPage: z.coerce.number().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  orderBy: z.enum(['name', 'createdAt', 'updatedAt']).optional(),
  search: z.string().optional(),
})

export class GetAllServicesQueryDto extends createZodDto(getAllServicesQuery) {}

export const getAllServicesParams = z.object({
  organizationId: z.ulid(),
})

export class GetAllServicesParamsDto extends createZodDto(getAllServicesParams) {}

export const getAllServicesResponse = z.object({
  services: z.array(httpServiceSchema),
  total: z.number(),
})

export class GetAllServicesResponseDto extends createZodDto(getAllServicesResponse) {}

@ApiTags('Services')
@Controller('organizations/:organizationId/services')
@AllowAnonymous()
export class GetAllServicesController {
  constructor(private readonly getAllServicesService: GetAllServicesService) {}

  @Get('')
  @ApiOperation({
    summary: 'Get all services',
    description: 'Retrieve all services within an organization.',
  })
  @ZodResponse({
    type: GetAllServicesResponseDto,
    description: 'Successful response with all services details',
  })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiParam({
    name: 'organizationId',
    description: 'The unique identifier of the organization',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description: 'Number of items per page for pagination',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Order of the results (asc or desc)',
    enum: ['asc', 'desc'],
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Field to order the results by',
    enum: ['name', 'createdAt', 'updatedAt'],
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter services by name',
  })
  async handle(
    @Query() query: GetAllServicesQueryDto,
    @Param() params: GetAllServicesParamsDto,
  ): Promise<GetAllServicesResponseDto> {
    const { page, perPage, order, orderBy, search } = query
    const { organizationId } = params

    const result = await this.getAllServicesService.execute({
      organizationId,
      page,
      perPage,
      order,
      orderBy,
      search,
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

    const { services, total } = result.value

    return {
      services: services.map(PrismaServiceMapper.toHttp),
      total,
    }
  }
}
