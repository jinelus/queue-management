import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import z from 'zod'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { GetDashboardSummaryService } from '@/domain/master/application/services/analytics/get-dashboard-summary.service'
import {
  ApiZodNotFoundResponse,
  ApiZodUnauthorizedResponse,
} from '../../errors/swagger-zod-error.decorator'

export const getDashboardSummaryParams = z.object({
  organizationId: z.string(),
})

export class GetDashboardSummaryParamsDto extends createZodDto(getDashboardSummaryParams) {}

export const serviceSummarySchema = z.object({
  serviceId: z.string(),
  serviceName: z.string(),
  isActive: z.boolean(),
  waitingCount: z.number(),
  activeStaffCount: z.number(),
  estimatedWaitTime: z.number().nullable(),
  isAlert: z.boolean(),
})

export const getDashboardSummaryResponse = z.object({
  services: z.array(serviceSummarySchema),
  totalWaiting: z.number(),
  totalActiveStaff: z.number(),
})

export class GetDashboardSummaryResponseDto extends createZodDto(getDashboardSummaryResponse) {}

@ApiTags('Analytics')
@Controller('organizations/:organizationId/dashboard')
@ApiBearerAuth()
export class GetDashboardSummaryController {
  constructor(private readonly getDashboardSummaryService: GetDashboardSummaryService) {}

  @Get('')
  @ApiOperation({
    summary: 'Get admin dashboard summary',
    description:
      'Retrieve a summary of all services with queue counts, active staff, and alert status.',
  })
  @ZodResponse({
    status: 200,
    type: GetDashboardSummaryResponseDto,
    description: 'Successful response with dashboard summary',
  })
  @ApiZodNotFoundResponse()
  @ApiZodUnauthorizedResponse()
  @ApiParam({
    name: 'organizationId',
    description: 'The unique identifier of the organization',
    type: String,
  })
  async handle(
    @Session() session: UserSession,
    @Param() params: GetDashboardSummaryParamsDto,
  ): Promise<GetDashboardSummaryResponseDto> {
    const userId = session.user.id
    const { organizationId } = params

    const result = await this.getDashboardSummaryService.execute({
      organizationId,
      userId,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case NotFoundError:
          throw new NotFoundException(error.message)
        case NotAllowedError:
          throw new ForbiddenException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return result.value
  }
}
