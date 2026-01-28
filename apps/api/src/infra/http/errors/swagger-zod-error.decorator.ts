// swagger-zod-errors.decorator.ts
import { applyDecorators, type Type } from '@nestjs/common'
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger'

// Convenience decorators using the default error DTOs.
import {
  BadRequestErrorDto,
  ConflictErrorDto,
  InternalServerErrorDto,
  NotFoundErrorDto,
  UnauthorizedErrorDto,
} from './errors.dto'

// Generic decorator that accepts a DTO as a reference.
export function ApiZodResponse<T>(
  status: number,
  description: string,
  dto: Type<T>,
): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(dto),
    ApiResponse({
      status,
      description,
      schema: { $ref: getSchemaPath(dto) },
    }),
  )
}
export function ApiZodBadRequestResponse(): MethodDecorator {
  return ApiZodResponse(400, 'Bad Request', BadRequestErrorDto)
}

export function ApiZodNotFoundResponse(): MethodDecorator {
  return ApiZodResponse(404, 'Not Found', NotFoundErrorDto)
}

export function ApiZodInternalServerErrorResponse(): MethodDecorator {
  return ApiZodResponse(500, 'Internal Server Error', InternalServerErrorDto)
}

export function ApiZodUnauthorizedResponse(): MethodDecorator {
  return ApiZodResponse(401, 'Unauthorized', UnauthorizedErrorDto)
}

export function ApiZodConflictResponse(): MethodDecorator {
  return ApiZodResponse(409, 'Conflict', ConflictErrorDto)
}

export function ApiZodGenericErrorsResponse(): MethodDecorator {
  return applyDecorators(
    ApiZodBadRequestResponse(),
    ApiZodNotFoundResponse(),
    ApiZodInternalServerErrorResponse(),
    ApiZodUnauthorizedResponse(),
    ApiZodConflictResponse(),
  )
}
