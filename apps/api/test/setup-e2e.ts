import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/infra/database/generated/prisma/client'
import 'dotenv/config'

import { execSync } from 'node:child_process'

import { ulid } from 'ulid'

const schemaId = ulid()

process.env.DATABASE_URL = `postgresql://postgres:docker@localhost:5432/api_hospital?schema=${schemaId}`

let prisma: PrismaClient

beforeAll(async () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  })
  prisma = new PrismaClient({
    adapter,
  })

  execSync('pnpm prisma migrate deploy')
})

afterAll(async () => {
  if (prisma) {
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)

    await prisma.$disconnect()
  }
})
