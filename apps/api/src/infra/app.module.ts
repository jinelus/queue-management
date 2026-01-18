import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { env } from '@repo/env'
import { AuthGuard, AuthModule } from '@thallesp/nestjs-better-auth'
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod'
import { auth } from '@/auth'
import { EnvModule } from './env/env.module'

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      validate() {
        return env
      },
      isGlobal: true,
    }),
    EnvModule,
    AuthModule.forRoot({
      auth,
    }),
  ],
})
export class AppModule {}
