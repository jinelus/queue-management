import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'prisma/src/generated/prisma/client'
import type { EnvService } from 'src/infra/env/env.service'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(readonly envSevice: EnvService) {
    const adapter = new PrismaPg({
      connectionString: envSevice.get('DATABASE_URL'),
    })
    super({
      adapter,
      log: ['warn', 'error'],
    })
  }
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
