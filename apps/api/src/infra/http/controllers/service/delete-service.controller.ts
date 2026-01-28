import { BadRequestException, Controller, Delete, NotFoundException, Param } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Roles, Session, type UserSession } from '@thallesp/nestjs-better-auth'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import z from 'zod'
import { NotFoundError } from '@/core/errors/not-found-error'
import { DeleteServiceService } from '@/domain/master/application/services/service/delete-service.service'

export const deleteServiceParams = z.object({
  organizationId: z.ulid(),
  serviceId: z.ulid(),
})

export class DeleteServiceParamsDto extends createZodDto(deleteServiceParams) {}

export const deleteServiceResponse = z.object({
  message: z.string(),
})

export class DeleteServiceResponseDto extends createZodDto(deleteServiceResponse) {}

@ApiTags('Services')
@Controller('organizations/:organizationId/services/:serviceId')
@ApiBearerAuth()
@Roles(['admin'])
export class DeleteServiceController {
  constructor(private readonly deleteServiceService: DeleteServiceService) {}

  @Delete('')
  @ApiOperation({
    summary: 'Delete a service',
    description: 'Delete a service within an organization.',
  })
  @ZodResponse({
    type: DeleteServiceResponseDto,
    description: 'Successful response with deleted service details',
  })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiParam({
    name: 'organizationId',
    description: 'The unique identifier of the organization',
    type: String,
  })
  @ApiParam({
    name: 'serviceId',
    description: 'The unique identifier of the service to be deleted',
    type: String,
  })
  async handle(
    @Session() session: UserSession,
    @Param() params: DeleteServiceParamsDto,
  ): Promise<DeleteServiceResponseDto> {
    const currentUserId = session.user.id
    const { organizationId, serviceId } = params

    const result = await this.deleteServiceService.execute({
      serviceId,
      organizationId,
      userId: currentUserId,
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

    return {
      message: 'Service deleted successfully',
    }
  }
}
