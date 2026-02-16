import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { makeOrganization } from '../../factories/make-organization'
import { makeService } from '../../factories/make-service'
import { makeServiceStaff } from '../../factories/make-service-staff'
import { makeEmployee } from '../../factories/make-user'
import { prisma } from '../../setup-e2e'
import { authenticate } from '../../utils/authenticate'

describe('Toggle Staff Status (E2E)', () => {
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

  it('[PATCH] /organizations/:organizationId/service-staff/:serviceStaffId/status - should set staff online', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    const serviceStaff = await makeServiceStaff(prisma, employee.id, service.id, {
      isOnline: false,
    })
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organization.id}/service-staff/${serviceStaff.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        isOnline: true,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.serviceStaff.isOnline).toBe(true)
  })

  it('[PATCH] /organizations/:organizationId/service-staff/:serviceStaffId/status - should set staff offline', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    const serviceStaff = await makeServiceStaff(prisma, employee.id, service.id, { isOnline: true })
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organization.id}/service-staff/${serviceStaff.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        isOnline: false,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.serviceStaff.isOnline).toBe(false)
  })

  it('[PATCH] /organizations/:organizationId/service-staff/:serviceStaffId/status - should close counter', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    const serviceStaff = await makeServiceStaff(prisma, employee.id, service.id, {
      isCounterClosed: false,
    })
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organization.id}/service-staff/${serviceStaff.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        isCounterClosed: true,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.serviceStaff.isCounterClosed).toBe(true)
  })

  it('[PATCH] /organizations/:organizationId/service-staff/:serviceStaffId/status - should return 401 without authentication', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    const serviceStaff = await makeServiceStaff(prisma, employee.id, service.id)

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organization.id}/service-staff/${serviceStaff.id}/status`)
      .send({
        isOnline: true,
      })

    expect(response.statusCode).toBe(401)
  })

  it('[PATCH] /organizations/:organizationId/service-staff/:serviceStaffId/status - should return 404 when service staff does not exist', async () => {
    const organization = await makeOrganization(prisma)
    const employee = await makeEmployee(prisma, organization.id)
    const fakeServiceStaffId = '01HMVVQXYXNQBPQVGZPFX3YV8Q'
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organization.id}/service-staff/${fakeServiceStaffId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        isOnline: true,
      })

    expect(response.statusCode).toBe(404)
  })
})
