import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { env } from '@repo/env'
import { EnvModule } from './env/env.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate() {
        return env
      },
      isGlobal: true,
    }),
    EnvModule,
  ],
})
export class AppModule {}
