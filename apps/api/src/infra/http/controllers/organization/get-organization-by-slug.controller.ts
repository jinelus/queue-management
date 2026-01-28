import { BadRequestException, Controller, Get, NotFoundException, Param } from '@nestjs/common'
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
import { GetOrganizationBySlugService } from '@/domain/master/application/services/organization/get-organization-by-slug.service'
import {
  httpOrganizationSchema,
  PrismaOrganizationMapper,
} from '@/infra/database/prisma/mappers/prisma-organization.mapper'

export const getOrganizationBySlugParams = z.object({
  slug: z.string(),
})

export class GetOrganizationBySlugParamsDto extends createZodDto(getOrganizationBySlugParams) {}

export const getOrganizationBySlugResponse = z.object({
  organization: httpOrganizationSchema,
})

export class GetOrganizationBySlugResponseDto extends createZodDto(getOrganizationBySlugResponse) {}

@ApiTags('Organizations')
@Controller('organizations/by-slug/:slug')
@ApiBearerAuth()
export class GetOrganizationBySlugController {
  constructor(private readonly getOrganizationBySlugService: GetOrganizationBySlugService) {}

  @Get('')
  @ApiOperation({
    summary: 'Get organization by slug',
    description: 'Retrieve an organization by its unique slug.',
  })
  @ZodResponse({
    type: GetOrganizationBySlugResponseDto,
    description: 'Successful response with organization details',
  })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiParam({
    name: 'slug',
    description: 'The unique slug of the organization',
    type: String,
  })
  async handle(
    @Session() session: UserSession,
    @Param() params: GetOrganizationBySlugParamsDto,
  ): Promise<GetOrganizationBySlugResponseDto> {
    const currentUserId = session.user.id
    const { slug } = params

    const result = await this.getOrganizationBySlugService.execute({
      slug,
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

    const { organization } = result.value

    return {
      organization: PrismaOrganizationMapper.toHttp(organization),
    }
  }
}
