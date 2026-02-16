import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { makeOrganization } from '../../factories/make-organization'
import { makeService } from '../../factories/make-service'
import { makeTicket } from '../../factories/make-ticket'
import { makeEmployee } from '../../factories/make-user'
import { prisma } from '../../setup-e2e'
import { authenticate } from '../../utils/authenticate'

describe('Snooze Ticket (E2E)', () => {
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

  it('[PATCH] /organizations/:organizationId/tickets/:ticketId/snooze - should snooze ticket', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    const ticket = await makeTicket(prisma, organization.id, service.id, {
      status: 'WAITING',
    })
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organization.id}/tickets/${ticket.id}/snooze`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.ticket.status).toBe('WAITING')
  })

  it('[PATCH] /organizations/:organizationId/tickets/:ticketId/snooze - should return 401 without authentication', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const ticket = await makeTicket(prisma, organization.id, service.id)

    const response = await request(app.getHttpServer()).patch(
      `/organizations/${organization.id}/tickets/${ticket.id}/snooze`,
    )

    expect(response.statusCode).toBe(401)
  })

  it('[PATCH] /organizations/:organizationId/tickets/:ticketId/snooze - should return 404 when ticket does not exist', async () => {
    const organization = await makeOrganization(prisma)
    const employee = await makeEmployee(prisma, organization.id)
    const fakeTicketId = '01HMVVQXYXNQBPQVGZPFX3YV8Q'
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organization.id}/tickets/${fakeTicketId}/snooze`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(404)
  })
})
