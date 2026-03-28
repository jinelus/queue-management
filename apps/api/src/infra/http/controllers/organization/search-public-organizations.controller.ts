import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import z from 'zod'
import { SearchPublicOrganizationsService } from '@/domain/master/application/services/organization/search-public-organizations.service'
import {
  httpOrganizationSchema,
  PrismaOrganizationMapper,
} from '@/infra/database/prisma/mappers/prisma-organization.mapper'

export const searchPublicOrganizationsQuery = z.object({
  q: z.string().optional(),
  page: z.coerce.number().optional(),
  perPage: z.coerce.number().optional(),
  orderBy: z.enum(['name', 'slug']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
})

export class SearchPublicOrganizationsQueryDto extends createZodDto(
  searchPublicOrganizationsQuery,
) {}

export const searchPublicOrganizationsResponse = z.object({
  organizations: z.array(httpOrganizationSchema),
  meta: z.object({
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
  }),
})

export class SearchPublicOrganizationsResponseDto extends createZodDto(
  searchPublicOrganizationsResponse,
) {}

@ApiTags('Public Organizations')
@Controller('public/organizations')
@AllowAnonymous()
export class SearchPublicOrganizationsController {
  constructor(
    private readonly searchPublicOrganizationsService: SearchPublicOrganizationsService,
  ) {}

  @Get('')
  @ApiOperation({
    summary: 'Search public organizations',
    description: 'Search organizations by name or slug for public ticket creation flow.',
  })
  @ZodResponse({
    status: 200,
    type: SearchPublicOrganizationsResponseDto,
    description: 'Successful response with organizations list',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search by organization name or slug',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description: 'Number of organizations per page',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Field to order by',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Order direction',
  })
  async handle(
    @Query() query: SearchPublicOrganizationsQueryDto,
  ): Promise<SearchPublicOrganizationsResponseDto> {
    const result = await this.searchPublicOrganizationsService.execute({
      search: query.q,
      page: query.page,
      perPage: query.perPage,
      orderBy: query.orderBy,
      order: query.order,
    })

    if (result.isLeft()) {
      return null
    }

    const { organizations, meta } = result.value

    return {
      organizations: organizations.map(PrismaOrganizationMapper.toHttp),
      meta,
    }
  }
}
