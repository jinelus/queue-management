import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { makeOrganization } from '../../factories/make-organization'
import { makeService } from '../../factories/make-service'
import { makeTicket } from '../../factories/make-ticket'
import { prisma } from '../../setup-e2e'

describe('Leave Queue (E2E)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[PATCH] /organizations/:organizationId/tickets/:ticketId/leave-queue - should leave queue', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const ticket = await makeTicket(prisma, organization.id, service.id, {
      status: 'WAITING',
    })

    const response = await request(app.getHttpServer()).patch(
      `/organizations/${organization.id}/tickets/${ticket.id}/leave-queue`,
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.ticket.status).toBe('CANCELLED')
  })

  it('[PATCH] /organizations/:organizationId/tickets/:ticketId/leave-queue - should return 404 when ticket does not exist', async () => {
    const organization = await makeOrganization(prisma)
    const fakeTicketId = '01HMVVQXYXNQBPQVGZPFX3YV8Q'

    const response = await request(app.getHttpServer()).patch(
      `/organizations/${organization.id}/tickets/${fakeTicketId}/leave-queue`,
    )

    expect(response.statusCode).toBe(404)
  })

  it('[PATCH] /organizations/:organizationId/tickets/:ticketId/leave-queue - should return 400 when ticket is not in waiting status', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const ticket = await makeTicket(prisma, organization.id, service.id, {
      status: 'SERVED',
    })

    const response = await request(app.getHttpServer()).patch(
      `/organizations/${organization.id}/tickets/${ticket.id}/leave-queue`,
    )

    expect(response.statusCode).toBe(400)
  })
})
