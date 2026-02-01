import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { env } from '@repo/env'
import { AuthGuard, AuthModule } from '@thallesp/nestjs-better-auth'
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod'
import { auth } from '../auth'
import { EnvModule } from './env/env.module'
import { EventsModule } from './events/events.module'
import { AnalyticsModule } from './http/controllers/analytics/analytics.module'
import { OrganizationModule } from './http/controllers/organization/organization.module'
import { ServiceModule } from './http/controllers/service/service.module'
import { ServiceStaffModule } from './http/controllers/service-staff/service-staff.module'
import { TicketModule } from './http/controllers/ticket/ticket.module'
import { UserModule } from './http/controllers/user/user.module'
import { GatewayModule } from './http/gateway/gateway.module'

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
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
          url: env.REDIS_URL,
        },
      }),
    }),
    EventEmitterModule.forRoot(),
    UserModule,
    OrganizationModule,
    ServiceModule,
    TicketModule,
    ServiceStaffModule,
    EventsModule,
    GatewayModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
