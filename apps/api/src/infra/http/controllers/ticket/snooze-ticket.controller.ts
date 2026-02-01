import {
  BadRequestException,
  Controller,
  HttpCode,
  Param,
  Patch,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { createZodDto, ZodResponse } from "nestjs-zod";
import z from "zod";
import { NotFoundError } from "@/core/errors/not-found-error";
import { SnoozeTicketService } from "@/domain/master/application/services/ticket/snooze-ticket.service";
import {
  httpTicketSchema,
  PrismaTicketMapper,
} from "@/infra/database/prisma/mappers/prisma-ticket.mapper";

export const snoozeTicketParams = z.object({
  organizationId: z.string(),
  ticketId: z.string(),
});
export class SnoozeTicketParamsDto extends createZodDto(snoozeTicketParams) {}

export const snoozeTicketResponse = z.object({
  ticket: httpTicketSchema,
});
export class SnoozeTicketResponseDto extends createZodDto(
  snoozeTicketResponse,
) {}

@ApiTags("Tickets")
@Controller("organizations/:organizationId/tickets/:ticketId/snooze")
export class SnoozeTicketController {
  constructor(private readonly snoozeTicketService: SnoozeTicketService) {}

  @Patch("")
  @HttpCode(200)
  @ApiOperation({
    summary: "Snooze a ticket",
    description: "Move a ticket to the back of the waiting queue.",
  })
  @ZodResponse({
    type: SnoozeTicketResponseDto,
    description: "Successful response with updated ticket details",
  })
  @ApiUnauthorizedResponse()
  @ApiParam({
    name: "organizationId",
    description: "The unique identifier of the organization",
    type: String,
  })
  @ApiParam({
    name: "ticketId",
    description: "The unique identifier of the ticket",
    type: String,
  })
  async handle(
    @Param() params: SnoozeTicketParamsDto,
  ): Promise<SnoozeTicketResponseDto> {
    const { organizationId, ticketId } = params;

    const result = await this.snoozeTicketService.execute({
      organizationId,
      ticketId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NotFoundError:
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const { ticket } = result.value;

    return {
      ticket: PrismaTicketMapper.toHttp(ticket),
    };
  }
}
