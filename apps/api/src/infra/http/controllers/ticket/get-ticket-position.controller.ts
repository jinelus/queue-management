import { BadRequestException, Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import z from 'zod'
import { NotFoundError } from '@/core/errors/not-found-error'
import { GetTicketPositionService } from '@/domain/master/application/services/ticket/get-ticket-position.service'
import {
  httpTicketSchema,
  PrismaTicketMapper,
} from '@/infra/database/prisma/mappers/prisma-ticket.mapper'
import {
  ApiZodNotFoundResponse,
  ApiZodUnauthorizedResponse,
} from '../../errors/swagger-zod-error.decorator'

export const getTicketPositionParams = z.object({
  organizationId: z.ulid(),
  ticketId: z.ulid(),
})

export class GetTicketPositionParamsDto extends createZodDto(getTicketPositionParams) {}

export const getTicketPositionResponse = z.object({
  ticket: httpTicketSchema,
  position: z.number().nullable(),
  estimatedWaitTime: z.number().nullable(),
})

export class GetTicketPositionResponseDto extends createZodDto(getTicketPositionResponse) {}

@ApiTags('Tickets')
@Controller('organizations/:organizationId/tickets/:ticketId/position')
@AllowAnonymous()
export class GetTicketPositionController {
  constructor(private readonly getTicketPositionService: GetTicketPositionService) {}

  @Get('')
  @ApiOperation({
    summary: 'Get the position of a ticket in the queue',
    description: 'Retrieve the position of a ticket within an organization.',
  })
  @ZodResponse({
    status: 200,
    type: GetTicketPositionResponseDto,
    description: 'Successful response with ticket position details',
  })
  @ApiZodNotFoundResponse()
  @ApiZodUnauthorizedResponse()
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
  async handle(@Param() params: GetTicketPositionParamsDto): Promise<GetTicketPositionResponseDto> {
    const { organizationId, ticketId } = params
    const result = await this.getTicketPositionService.execute({
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

    const { ticket, position, estimatedWaitTime } = result.value

    return {
      ticket: PrismaTicketMapper.toHttp(ticket),
      position,
      estimatedWaitTime,
    }
  }
}
