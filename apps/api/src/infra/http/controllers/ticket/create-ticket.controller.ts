import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'
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
import { CreateTicketService } from '@/domain/master/application/services/ticket/create-ticket.service'
import {
  httpTicketSchema,
  PrismaTicketMapper,
} from '@/infra/database/prisma/mappers/prisma-ticket.mapper'

export const createTicketBody = z.object({
  guestName: z.string().min(1).max(255),
  serviceId: z.ulid(),
})

export class CreateTicketBodyDto extends createZodDto(createTicketBody) {}

export const createTicketParams = z.object({
  organizationId: z.ulid(),
})

export class CreateTicketParamsDto extends createZodDto(createTicketParams) {}

export const createTicketResponse = z.object({
  ticket: httpTicketSchema,
})

export class CreateTicketResponseDto extends createZodDto(createTicketResponse) {}

@ApiTags('Tickets')
@Controller('organizations/:organizationId/tickets')
@AllowAnonymous()
export class CreateTicketController {
  constructor(private readonly createTicketService: CreateTicketService) {}

  @Post('')
  @ApiOperation({
    summary: 'Create a new ticket',
    description: 'Create a new ticket within an organization.',
  })
  @ZodResponse({
    type: CreateTicketResponseDto,
    description: 'Successful response with created ticket details',
  })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiParam({
    name: 'organizationId',
    description: 'The unique identifier of the organization',
    type: String,
  })
  async handle(
    @Body() body: CreateTicketBodyDto,
    @Param() params: CreateTicketParamsDto,
  ): Promise<CreateTicketResponseDto> {
    const { guestName, serviceId } = body
    const { organizationId } = params

    const result = await this.createTicketService.execute({
      guestName,
      serviceId,
      organizationId,
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
