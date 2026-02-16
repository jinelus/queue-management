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

describe('Update Ticket Status (E2E)', () => {
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

  it('[PUT] /organizations/:organizationId/tickets/:ticketId/status - should update ticket status', async () => {
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
      .put(`/organizations/${organization.id}/tickets/${ticket.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'CALLED',
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.ticket.status).toBe('CALLED')
  })

  it('[PUT] /organizations/:organizationId/tickets/:ticketId/status - should serve ticket', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    const ticket = await makeTicket(prisma, organization.id, service.id, {
      status: 'CALLED',
    })
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .put(`/organizations/${organization.id}/tickets/${ticket.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'SERVING',
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.ticket.status).toBe('SERVING')
    expect(response.body.ticket.servedById).toBe(employee.id)
  })

  it('[PUT] /organizations/:organizationId/tickets/:ticketId/status - should complete ticket', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    // First serve the ticket, then complete it
    const ticket = await makeTicket(prisma, organization.id, service.id, {
      status: 'CALLED',
    })
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    // First serve it
    await request(app.getHttpServer())
      .put(`/organizations/${organization.id}/tickets/${ticket.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'SERVING',
      })

    // Then complete it
    const response = await request(app.getHttpServer())
      .put(`/organizations/${organization.id}/tickets/${ticket.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'SERVED',
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.ticket.status).toBe('SERVED')
  })

  it('[PUT] /organizations/:organizationId/tickets/:ticketId/status - should mark ticket as absent', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    const ticket = await makeTicket(prisma, organization.id, service.id, {
      status: 'CALLED',
    })
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .put(`/organizations/${organization.id}/tickets/${ticket.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'ABSENT',
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.ticket.status).toBe('ABSENT')
  })

  it('[PUT] /organizations/:organizationId/tickets/:ticketId/status - should return 401 without authentication', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const ticket = await makeTicket(prisma, organization.id, service.id)

    const response = await request(app.getHttpServer())
      .put(`/organizations/${organization.id}/tickets/${ticket.id}/status`)
      .send({
        status: 'CALLED',
      })

    expect(response.statusCode).toBe(401)
  })

  it('[PUT] /organizations/:organizationId/tickets/:ticketId/status - should return 404 when ticket does not exist', async () => {
    const organization = await makeOrganization(prisma)
    const employee = await makeEmployee(prisma, organization.id)
    const fakeTicketId = '01HMVVQXYXNQBPQVGZPFX3YV8Q'
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .put(`/organizations/${organization.id}/tickets/${fakeTicketId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'CALLED',
      })

    expect(response.statusCode).toBe(404)
  })

  it('[PUT] /organizations/:organizationId/tickets/:ticketId/status - should return 400 for invalid status transition', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    const ticket = await makeTicket(prisma, organization.id, service.id, {
      status: 'SERVED',
    })
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .put(`/organizations/${organization.id}/tickets/${ticket.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'WAITING',
      })

    expect(response.statusCode).toBe(400)
  })
})
