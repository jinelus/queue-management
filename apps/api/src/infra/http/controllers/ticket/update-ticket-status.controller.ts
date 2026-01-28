import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
  Session,
  UnauthorizedException,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { type UserSession } from '@thallesp/nestjs-better-auth'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import z from 'zod'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { UpdateTicketStatusService } from '@/domain/master/application/services/ticket/update-ticket-status.service'
import {
  httpTicketSchema,
  PrismaTicketMapper,
} from '@/infra/database/prisma/mappers/prisma-ticket.mapper'

export const updateTicketStatusBody = z.object({
  status: z.enum(['WAITING', 'CALLED', 'SERVING', 'SERVED', 'ABSENT', 'CANCELLED']),
})

export class UpdateTicketStatusBodyDto extends createZodDto(updateTicketStatusBody) {}

export const updateTicketStatusParams = z.object({
  organizationId: z.ulid(),
  ticketId: z.ulid(),
})

export class UpdateTicketStatusParamsDto extends createZodDto(updateTicketStatusParams) {}

export const updateTicketStatusResponse = z.object({
  ticket: httpTicketSchema,
})

export class UpdateTicketStatusResponseDto extends createZodDto(updateTicketStatusResponse) {}

@ApiTags('Tickets')
@Controller('organizations/:organizationId/tickets/:ticketId/status')
@ApiBearerAuth()
export class UpdateTicketStatusController {
  constructor(private readonly updateTicketStatusService: UpdateTicketStatusService) {}

  @Put('')
  @ApiOperation({
    summary: 'Update the status of a ticket',
    description: 'Update the status of a ticket within an organization.',
  })
  @ZodResponse({
    type: UpdateTicketStatusResponseDto,
    description: 'Successful response with updated ticket details',
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
  async handle(
    @Session() session: UserSession,
    @Body() body: UpdateTicketStatusBodyDto,
    @Param() params: UpdateTicketStatusParamsDto,
  ): Promise<UpdateTicketStatusResponseDto> {
    const staffId = session.user.id
    const { status } = body
    const { organizationId, ticketId } = params

    const result = await this.updateTicketStatusService.execute({
      ticketId,
      status,
      organizationId,
      staffId,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case NotFoundError:
          throw new NotFoundException(error.message)
        case NotAllowedError:
          throw new UnauthorizedException(error.message)
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
