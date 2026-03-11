import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import z from 'zod'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { UnassignStaffFromService } from '@/domain/master/application/services/service-staff/unassign-staff-from-service.service'
import {
  ApiZodNotFoundResponse,
  ApiZodUnauthorizedResponse,
} from '../../errors/swagger-zod-error.decorator'

export const unassignStaffFromServiceBody = z.object({
  serviceId: z.ulid(),
  staffId: z.ulid(),
})

export class UnassignStaffFromServiceBodyDto extends createZodDto(unassignStaffFromServiceBody) {}

export const unassignStaffFromServiceParams = z.object({
  organizationId: z.ulid(),
})

export class UnassignStaffFromServiceParamsDto extends createZodDto(
  unassignStaffFromServiceParams,
) {}

export const unassignStaffFromServiceResponse = z.object({
  success: z.boolean(),
})

export class UnassignStaffFromServiceResponseDto extends createZodDto(
  unassignStaffFromServiceResponse,
) {}

@ApiTags('Service Staff')
@Controller('organizations/:organizationId/service-staff/unassign')
@ApiBearerAuth()
export class UnassignStaffFromServiceController {
  constructor(private readonly unassignStaffFromServiceService: UnassignStaffFromService) {}

  @Post('')
  @ApiOperation({
    summary: 'Unassign staff from a service',
    description: 'Remove a staff member assignment from a service within an organization.',
  })
  @ZodResponse({
    status: 200,
    type: UnassignStaffFromServiceResponseDto,
    description: 'Successful response confirming staff was unassigned',
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
    @Body() body: UnassignStaffFromServiceBodyDto,
    @Param() params: UnassignStaffFromServiceParamsDto,
  ): Promise<UnassignStaffFromServiceResponseDto> {
    const currentUserId = session.user.id
    const { serviceId, staffId } = body
    const { organizationId } = params

    const result = await this.unassignStaffFromServiceService.execute({
      serviceId,
      userId: staffId,
      organizationId,
      actorId: currentUserId,
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

    return { success: true }
  }
}
