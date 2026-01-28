import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const BadRequestErrorSchema = z.object({
  statusCode: z.literal(400),
  message: z.string(),
  errors: z
    .array(
      z.object({
        code: z.string(),
        expected: z.string(),
        received: z.string(),
        path: z.array(z.string()),
        message: z.string(),
      }),
    )
    .optional(),
})

export class BadRequestErrorDto extends createZodDto(BadRequestErrorSchema) {}

export const NotFoundErrorSchema = z.object({
  statusCode: z.literal(404),
  message: z.string(),
})

export class NotFoundErrorDto extends createZodDto(NotFoundErrorSchema) {}

export const InternalServerErrorSchema = z.object({
  statusCode: z.literal(500),
  message: z.string(),
})

export class InternalServerErrorDto extends createZodDto(InternalServerErrorSchema) {}

export const UnauthorizedErrorSchema = z.object({
  statusCode: z.literal(401),
  message: z.string(),
})

export class UnauthorizedErrorDto extends createZodDto(UnauthorizedErrorSchema) {}

export const ConflictErrorSchema = z.object({
  statusCode: z.literal(409),
  message: z.string(),
})

export class ConflictErrorDto extends createZodDto(ConflictErrorSchema) {}
