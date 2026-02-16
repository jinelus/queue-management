import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { makeOrganization } from '../../factories/make-organization'
import { makeService } from '../../factories/make-service'
import { makeServiceStaff } from '../../factories/make-service-staff'
import { makeTicket } from '../../factories/make-ticket'
import { makeEmployee } from '../../factories/make-user'
import { prisma } from '../../setup-e2e'
import { authenticate } from '../../utils/authenticate'

describe('Transfer Ticket (E2E)', () => {
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

  it('[PUT] /organizations/:organizationId/tickets/:ticketId/transfer - should transfer ticket to another service', async () => {
    const organization = await makeOrganization(prisma)
    const sourceService = await makeService(prisma, organization.id)
    const targetService = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    const ticket = await makeTicket(prisma, organization.id, sourceService.id)
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .put(`/organizations/${organization.id}/tickets/${ticket.id}/transfer`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        targetServiceId: targetService.id,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.ticket.serviceId).toBe(targetService.id)
  })

  it('[PUT] /organizations/:organizationId/tickets/:ticketId/transfer - should transfer ticket to specific staff', async () => {
    const organization = await makeOrganization(prisma)
    const sourceService = await makeService(prisma, organization.id)
    const targetService = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    const targetEmployee = await makeEmployee(prisma, organization.id)
    await makeServiceStaff(prisma, targetEmployee.id, targetService.id, {
      isOnline: true,
      isCounterClosed: false,
    })
    const ticket = await makeTicket(prisma, organization.id, sourceService.id)
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .put(`/organizations/${organization.id}/tickets/${ticket.id}/transfer`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        targetServiceId: targetService.id,
        targetStaffId: targetEmployee.id,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.ticket.serviceId).toBe(targetService.id)
  })

  it('[PUT] /organizations/:organizationId/tickets/:ticketId/transfer - should return 401 without authentication', async () => {
    const organization = await makeOrganization(prisma)
    const sourceService = await makeService(prisma, organization.id)
    const targetService = await makeService(prisma, organization.id)
    const ticket = await makeTicket(prisma, organization.id, sourceService.id)

    const response = await request(app.getHttpServer())
      .put(`/organizations/${organization.id}/tickets/${ticket.id}/transfer`)
      .send({
        targetServiceId: targetService.id,
      })

    expect(response.statusCode).toBe(401)
  })

  it('[PUT] /organizations/:organizationId/tickets/:ticketId/transfer - should return 404 when ticket does not exist', async () => {
    const organization = await makeOrganization(prisma)
    const targetService = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    const fakeTicketId = '01HMVVQXYXNQBPQVGZPFX3YV8Q'
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .put(`/organizations/${organization.id}/tickets/${fakeTicketId}/transfer`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        targetServiceId: targetService.id,
      })

    expect(response.statusCode).toBe(404)
  })

  it('[PUT] /organizations/:organizationId/tickets/:ticketId/transfer - should return 404 when target service does not exist', async () => {
    const organization = await makeOrganization(prisma)
    const sourceService = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    const ticket = await makeTicket(prisma, organization.id, sourceService.id)
    const fakeServiceId = '01HMVVQXYXNQBPQVGZPFX3YV8Q'
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .put(`/organizations/${organization.id}/tickets/${ticket.id}/transfer`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        targetServiceId: fakeServiceId,
      })

    expect(response.statusCode).toBe(404)
  })
})
