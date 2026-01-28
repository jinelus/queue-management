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
import { TransferTicketService } from '@/domain/master/application/services/ticket/transfer-ticket.service'
import {
  httpTicketSchema,
  PrismaTicketMapper,
} from '@/infra/database/prisma/mappers/prisma-ticket.mapper'

export const transferTicketBody = z.object({
  targetServiceId: z.ulid(),
})

export class TransferTicketBodyDto extends createZodDto(transferTicketBody) {}

export const transferTicketParams = z.object({
  organizationId: z.ulid(),
  ticketId: z.ulid(),
})

export class TransferTicketParamsDto extends createZodDto(transferTicketParams) {}

export const transferTicketResponse = z.object({
  ticket: httpTicketSchema,
})

export class TransferTicketResponseDto extends createZodDto(transferTicketResponse) {}

@ApiTags('Tickets')
@Controller('organizations/:organizationId/tickets/:ticketId/transfer')
@ApiBearerAuth()
export class TransferTicketController {
  constructor(private readonly transferTicketService: TransferTicketService) {}

  @Put('')
  @ApiOperation({
    summary: 'Transfer a ticket to another service',
    description: 'Transfer a ticket to another service within an organization.',
  })
  @ZodResponse({
    type: TransferTicketResponseDto,
    description: 'Successful response with transferred ticket details',
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
    @Body() body: TransferTicketBodyDto,
    @Param() params: TransferTicketParamsDto,
  ): Promise<TransferTicketResponseDto> {
    const staffId = session.user.id
    const { targetServiceId } = body
    const { organizationId, ticketId } = params

    const result = await this.transferTicketService.execute({
      ticketId,
      targetServiceId,
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
