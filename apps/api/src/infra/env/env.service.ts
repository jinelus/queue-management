import { Injectable } from '@nestjs/common'
import { ConfigService, PathValue } from '@nestjs/config'
import { env } from '@repo/env'

type GetEnv<T extends keyof typeof env> = PathValue<
  {
    DATABASE_URL: string
    NODE_ENV?: string
    BETTER_AUTH_SECRET?: string
    BETTER_AUTH_URL?: string
    PORT?: number
    FRONT_END_URL?: string
    REDIS_HOST: string
    REDIS_PORT: number
    REDIS_URL?: string
  },
  T
>
@Injectable()
export class EnvService {
  constructor(private configService: ConfigService<typeof env, true>) {}

  get<T extends keyof typeof env>(key: T): GetEnv<T> {
    return this.configService.get(key, { infer: true })
  }
}
