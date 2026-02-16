import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { makeOrganization } from '../../factories/make-organization'
import { makeService } from '../../factories/make-service'
import { makeTicket } from '../../factories/make-ticket'
import { prisma } from '../../setup-e2e'

describe('Get Ticket Position (E2E)', () => {
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

  it('[GET] /organizations/:organizationId/tickets/:ticketId/position - should get ticket position', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)

    // Create multiple tickets to establish queue positions
    const ticket1 = await makeTicket(prisma, organization.id, service.id, {
      status: 'WAITING',
    })
    await makeTicket(prisma, organization.id, service.id, {
      status: 'WAITING',
    })
    await makeTicket(prisma, organization.id, service.id, {
      status: 'WAITING',
    })

    const response = await request(app.getHttpServer()).get(
      `/organizations/${organization.id}/tickets/${ticket1.id}/position`,
    )

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      ticket: expect.objectContaining({
        id: ticket1.id,
        status: 'WAITING',
      }),
      position: expect.any(Number),
      estimatedWaitTime: expect.any(Number),
    })
  })

  it('[GET] /organizations/:organizationId/tickets/:ticketId/position - should return position 0 for called ticket', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const ticket = await makeTicket(prisma, organization.id, service.id, {
      status: 'CALLED',
    })

    const response = await request(app.getHttpServer()).get(
      `/organizations/${organization.id}/tickets/${ticket.id}/position`,
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.position).toBe(0)
  })

  it('[GET] /organizations/:organizationId/tickets/:ticketId/position - should return 404 when ticket does not exist', async () => {
    const organization = await makeOrganization(prisma)
    const fakeTicketId = '01HMVVQXYXNQBPQVGZPFX3YV8Q'

    const response = await request(app.getHttpServer()).get(
      `/organizations/${organization.id}/tickets/${fakeTicketId}/position`,
    )

    expect(response.statusCode).toBe(404)
  })

  it('[GET] /organizations/:organizationId/tickets/:ticketId/position - should return 404 for completed tickets', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const ticket = await makeTicket(prisma, organization.id, service.id, {
      status: 'SERVED',
    })

    const response = await request(app.getHttpServer()).get(
      `/organizations/${organization.id}/tickets/${ticket.id}/position`,
    )

    expect(response.statusCode).toBe(404)
  })
})
