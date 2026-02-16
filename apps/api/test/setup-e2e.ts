import { execSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { ulid } from "ulid";
import { PrismaClient } from "@/infra/database/generated/prisma/client";

const schemaId = ulid();

process.env.DATABASE_URL = `postgresql://queue_user:queue_password@localhost:5432/queue_management?schema=${schemaId}`;

export let prisma: PrismaClient;

beforeAll(async () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  prisma = new PrismaClient({
    adapter,
  });

  execSync("pnpm prisma migrate deploy");
});

afterAll(async () => {
  if (prisma) {
    await prisma.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`,
    );

    await prisma.$disconnect();
  }
});
