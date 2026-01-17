import { Module } from '@nestjs/common'
import { EnvModule } from '../env/env.module'
import { PrismaService } from './prisma/prisma.service'

@Module({
  imports: [EnvModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
