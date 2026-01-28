import { BadRequestException, Controller, NotFoundException, Param, Patch } from '@nestjs/common'
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
import { LeaveQueueService } from '@/domain/master/application/services/ticket/leave-queue.service'
import {
  httpTicketSchema,
  PrismaTicketMapper,
} from '@/infra/database/prisma/mappers/prisma-ticket.mapper'

export const leaveQueueParams = z.object({
  organizationId: z.ulid(),
  ticketId: z.ulid(),
})

export class LeaveQueueParamsDto extends createZodDto(leaveQueueParams) {}

export const leaveQueueResponse = z.object({
  ticket: httpTicketSchema,
})

export class LeaveQueueResponseDto extends createZodDto(leaveQueueResponse) {}

@ApiTags('Tickets')
@Controller('organizations/:organizationId/tickets/:ticketId/leave-queue')
@AllowAnonymous()
export class LeaveQueueController {
  constructor(private readonly leaveQueueService: LeaveQueueService) {}

  @Patch('')
  @ApiOperation({
    summary: 'Leave the queue for a ticket',
    description: 'Leave the queue for a ticket within an organization.',
  })
  @ZodResponse({
    type: LeaveQueueResponseDto,
    description: 'Successful response with left ticket details',
  })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiParam({
    name: 'organizationId',
    description: 'The unique identifier of the organization',
    type: String,
  })
  @ApiParam({
    name: 'ticketId',
    description: 'The unique identifier of the ticket',
    type: String,
  })
  async handle(@Param() params: LeaveQueueParamsDto): Promise<LeaveQueueResponseDto> {
    const { organizationId, ticketId } = params
    const result = await this.leaveQueueService.execute({
      organizationId,
      ticketId,
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

    const { ticket } = result.value

    return {
      ticket: PrismaTicketMapper.toHttp(ticket),
    }
  }
}
