import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { ulid } from 'ulid'
import { PrismaClient } from '../src/infra/database/generated/prisma/client'
import { TicketStatus } from '../src/infra/database/generated/prisma/enums'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

async function main() {
  console.log('Seeding database...')

  // 1. Create Organization
  const orgId = ulid()
  const organization = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      id: orgId,
      slug: 'acme-corp',
      name: 'Acme Corporation',
      description: 'A sample organization for testing queue management.',
    },
  })
  console.log({ organization })

  // 2. Create Users
  // Admin User
  const adminId = ulid()
  const adminEmail = 'admin@acme.com'
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      id: adminId,
      name: 'Admin User',
      email: adminEmail,
      role: 'admin',
      organizationId: organization.id,
      emailVerified: true,
    },
  })

  // Staff User 1
  const staff1Id = ulid()
  const staff1Email = 'staff1@acme.com'
  const staff1 = await prisma.user.upsert({
    where: { email: staff1Email },
    update: {},
    create: {
      id: staff1Id,
      name: 'Staff One',
      email: staff1Email,
      role: 'staff',
      organizationId: organization.id,
      emailVerified: true,
    },
  })

  // Staff User 2
  const staff2Id = ulid()
  const staff2Email = 'staff2@acme.com'
  const staff2 = await prisma.user.upsert({
    where: { email: staff2Email },
    update: {},
    create: {
      id: staff2Id,
      name: 'Staff Two',
      email: staff2Email,
      role: 'staff',
      organizationId: organization.id,
      emailVerified: true,
    },
  })

  console.log({ adminUser, staff1, staff2 })

  // 3. Create Services
  const service1Id = ulid()
  const service1 = await prisma.service.create({
    data: {
      id: service1Id,
      name: 'Customer Support',
      description: 'General support inquiries',
      avgDurationInt: 10,
      organizationId: organization.id,
    },
  })

  const service2Id = ulid()
  const service2 = await prisma.service.create({
    data: {
      id: service2Id,
      name: 'Technical Issues',
      description: 'Technical troubleshooting and repairs',
      avgDurationInt: 20,
      organizationId: organization.id,
    },
  })

  console.log({ service1, service2 })

  // 4. Assign Staff to Services
  await prisma.serviceStaff.createMany({
    data: [
      {
        userId: staff1.id,
        serviceId: service1.id,
      },
      {
        userId: staff2.id,
        serviceId: service1.id,
      },
      {
        userId: staff2.id,
        serviceId: service2.id,
      },
    ],
    skipDuplicates: true,
  })

  // 5. Create Tickets
  // Waiting tickets
  await prisma.ticket.create({
    data: {
      guestName: 'John Doe',
      status: TicketStatus.WAITING,
      organizationId: organization.id,
      serviceId: service1.id,
    },
  })

  await prisma.ticket.create({
    data: {
      guestName: 'Jane Smith',
      status: TicketStatus.WAITING,
      organizationId: organization.id,
      serviceId: service1.id,
    },
  })

  await prisma.ticket.create({
    data: {
      guestName: 'Alice Johnson',
      status: TicketStatus.WAITING,
      organizationId: organization.id,
      serviceId: service2.id,
    },
  })

  // Served/Completed tickets
  await prisma.ticket.create({
    data: {
      guestName: 'Bob Brown',
      status: TicketStatus.SERVED,
      organizationId: organization.id,
      serviceId: service1.id,
      servedById: staff1.id,
      startedAt: new Date(),
      completedAt: new Date(),
    },
  })

  console.log('Seeding completed.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
