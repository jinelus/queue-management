import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import z from 'zod'
import { BadRequestError } from '@/core/errors/bad-request-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { GetPublicOrganizationBySlugService } from '@/domain/master/application/services/organization/get-public-organization-by-slug.service'
import {
  httpOrganizationSchema,
  PrismaOrganizationMapper,
} from '@/infra/database/prisma/mappers/prisma-organization.mapper'
import { ApiZodNotFoundResponse } from '../../errors/swagger-zod-error.decorator'

export const getPublicOrganizationBySlugParams = z.object({
  slug: z.string(),
})

export class GetPublicOrganizationBySlugParamsDto extends createZodDto(
  getPublicOrganizationBySlugParams,
) {}

export const getPublicOrganizationBySlugResponse = z.object({
  organization: httpOrganizationSchema,
})

export class GetPublicOrganizationBySlugResponseDto extends createZodDto(
  getPublicOrganizationBySlugResponse,
) {}

@ApiTags('Public Organizations')
@Controller('public/organizations/by-slug/:slug')
@AllowAnonymous()
export class GetPublicOrganizationBySlugController {
  constructor(
    private readonly getPublicOrganizationBySlugService: GetPublicOrganizationBySlugService,
  ) {}

  @Get('')
  @ApiOperation({
    summary: 'Get public organization by slug',
    description: 'Retrieve an organization by slug for public ticket creation flow.',
  })
  @ZodResponse({
    status: 200,
    type: GetPublicOrganizationBySlugResponseDto,
    description: 'Successful response with organization details',
  })
  @ApiZodNotFoundResponse()
  @ApiParam({
    name: 'slug',
    description: 'The unique slug of the organization',
    type: String,
  })
  async handle(
    @Param() params: GetPublicOrganizationBySlugParamsDto,
  ): Promise<GetPublicOrganizationBySlugResponseDto> {
    const { slug } = params

    const result = await this.getPublicOrganizationBySlugService.execute({ slug })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case NotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestError(error.message)
      }
    }

    return {
      organization: PrismaOrganizationMapper.toHttp(result.value.organization),
    }
  }
}
