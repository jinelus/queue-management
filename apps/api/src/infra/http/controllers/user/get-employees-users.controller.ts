import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UnauthorizedException,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import z from 'zod'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { NotFoundError } from '@/core/errors/not-found-error'
import { GetEmployeesUsersService } from '@/domain/master/application/services/user/get-employees-users.service'
import {
  httpUserSchema,
  PrismaUserMapper,
} from '@/infra/database/prisma/mappers/prisma-user.mapper'

export const getEmployeesUsersParams = z.object({
  organizationId: z.ulid(),
})

export class GetEmployeesUsersParamsDto extends createZodDto(getEmployeesUsersParams) {}

export const getEmployeesUsersQuery = z.object({
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(10),
  order: z.enum(['asc', 'desc']).default('desc'),
  orderBy: z.enum(['createdAt', 'updatedAt', 'email']).default('createdAt'),
  search: z.string().optional(),
})

export class GetEmployeesUsersQueryDto extends createZodDto(getEmployeesUsersQuery) {}

export const getEmployeesUsersResponse = z.object({
  users: z.array(httpUserSchema),
  total: z.number(),
})

export class GetEmployeesUsersResponseDto extends createZodDto(getEmployeesUsersResponse) {}

@ApiTags('Users')
@Controller('organizations/:organizationId/users/employees')
@ApiBearerAuth()
export class GetEmployeesUsersController {
  constructor(private readonly getEmployeesUsersService: GetEmployeesUsersService) {}

  @Get('')
  @ApiOperation({
    summary: 'Get employees users',
    description: 'Retrieve employees users within an organization.',
  })
  @ZodResponse({
    type: GetEmployeesUsersResponseDto,
    description: 'Successful response with user details',
  })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  @ApiParam({
    name: 'organizationId',
    description: 'The unique identifier of the organization',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    default: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description: 'Number of items per page for pagination',
    default: 10,
    type: Number,
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Order of the results',
    default: 'desc',
    enum: ['asc', 'desc'],
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Field to order the results by',
    default: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'email'],
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter results',
    type: String,
  })
  async handle(
    @Session() session: UserSession,
    @Param() params: GetEmployeesUsersParamsDto,
    @Query() query: GetEmployeesUsersQueryDto,
  ): Promise<GetEmployeesUsersResponseDto> {
    const userId = session.user.id
    const { order, orderBy, page, perPage, search } = query

    const { organizationId } = params

    const result = await this.getEmployeesUsersService.execute({
      userId,
      organizationId,
      order,
      orderBy,
      page,
      perPage,
      search,
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

    const { users, total } = result.value

    return {
      users: users.map(PrismaUserMapper.toHttp),
      total,
    }
  }
}
