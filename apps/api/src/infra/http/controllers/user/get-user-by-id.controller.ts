import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import z from 'zod'
import { NotFoundError } from '@/core/errors/not-found-error'
import { GetUserByIdService } from '@/domain/master/application/services/user/get-user-by-id.service'
import {
  httpUserSchema,
  PrismaUserMapper,
} from '@/infra/database/prisma/mappers/prisma-user.mapper'

export const getUserByIdParams = z.object({
  organizationId: z.ulid(),
})

export class GetUserByIdParamsDto extends createZodDto(getUserByIdParams) {}

export const getUserByIdQuery = z.object({
  targetUserId: z.ulid().optional(),
})

export class GetUserByIdQueryDto extends createZodDto(getUserByIdQuery) {}

export const getUserByIdResponse = z.object({
  user: httpUserSchema,
})

export class GetUserByIdResponseDto extends createZodDto(getUserByIdResponse) {}

@ApiTags('Users')
@Controller('organizations/:organizationId/users/by-id')
@ApiBearerAuth()
export class GetUserByIdController {
  constructor(private readonly getUserByIdService: GetUserByIdService) {}

  @Get('')
  @ApiOperation({
    summary: 'Get user by id',
    description: 'Retrieve a user by their unique identifier within an organization.',
  })
  @ZodResponse({
    type: GetUserByIdResponseDto,
    description: 'Successful response with user details',
  })
  @ApiNotFoundResponse()
  @ApiParam({
    name: 'organizationId',
    description: 'The unique identifier of the organization',
    type: String,
  })
  @ApiQuery({
    name: 'targetUserId',
    description: 'The unique identifier of the user to retrieve',
    required: false,
    type: String,
  })
  async handle(
    @Session() session: UserSession,
    @Param() params: GetUserByIdParamsDto,
    @Query() query: GetUserByIdQueryDto,
  ): Promise<GetUserByIdResponseDto> {
    const currentUserId = session.user.id
    const targetUserId = query.targetUserId ?? currentUserId

    const { organizationId } = params

    const result = await this.getUserByIdService.execute({
      userId: targetUserId,
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

    const { user } = result.value

    return {
      user: PrismaUserMapper.toHttp(user),
    }
  }
}
