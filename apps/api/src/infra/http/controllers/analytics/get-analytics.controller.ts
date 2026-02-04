import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import z from 'zod'
import { GetHistoricalStatsService } from '@/domain/master/application/services/analytics/get-historical-stats.service'

export const getAnalyticsParams = z.object({
  organizationId: z.string(),
})
export class GetAnalyticsParamsDto extends createZodDto(getAnalyticsParams) {}

export const getAnalyticsQuery = z.object({
  days: z.coerce.number().min(1).max(365).default(7),
})
export class GetAnalyticsQueryDto extends createZodDto(getAnalyticsQuery) {}

export const getAnalyticsResponse = z.object({
  servedTicketsByDay: z.array(
    z.object({
      date: z.string(),
      count: z.number(),
    }),
  ),
  avgDurationByEmployee: z.array(
    z.object({
      employeeId: z.string(),
      employeeName: z.string(),
      avgDuration: z.number(),
    }),
  ),
})
export class GetAnalyticsResponseDto extends createZodDto(getAnalyticsResponse) {}

@ApiTags('Analytics')
@Controller('organizations/:organizationId/analytics')
@ApiBearerAuth()
export class GetAnalyticsController {
  constructor(private readonly getHistoricalStatsService: GetHistoricalStatsService) {}

  @Get('')
  @ApiOperation({
    summary: 'Get historical analytics',
    description: 'Retrieve served tickets count and average service duration.',
  })
  @ZodResponse({
    type: GetAnalyticsResponseDto,
    description: 'Successful response with analytics data',
  })
  @ApiUnauthorizedResponse()
  @ApiParam({
    name: 'organizationId',
    description: 'The unique identifier of the organization',
    type: String,
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to look back for served tickets (default: 7)',
    type: Number,
  })
  async handle(
    @Param() params: GetAnalyticsParamsDto,
    @Query() query: GetAnalyticsQueryDto,
    @Session() session: UserSession,
  ): Promise<GetAnalyticsResponseDto> {
    const userId = session.user.id
    const { organizationId } = params
    const { days } = query

    const result = await this.getHistoricalStatsService.execute({
      organizationId,
      days,
      userId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    return result.value
  }
}
