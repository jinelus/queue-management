import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { makeOrganization } from '../../factories/make-organization'
import { makeService } from '../../factories/make-service'
import { makeAdmin, makeEmployee } from '../../factories/make-user'
import { prisma } from '../../setup-e2e'
import { authenticate } from '../../utils/authenticate'

describe('Assign Staff to Service (E2E)', () => {
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

  it('[POST] /organizations/:organizationId/service-staff/assign - should assign staff to service', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    const admin = await makeAdmin(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: admin.id,
      role: 'admin',
    })

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/service-staff/assign`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        serviceId: service.id,
        staffId: employee.id,
      })

    expect(response.statusCode).toBe(201)
    expect(response.body.serviceStaff).toEqual({
      id: expect.any(String),
      userId: employee.id,
      serviceId: service.id,
      active: true,
      isOnline: false,
      isCounterClosed: false,
    })
  })

  it('[POST] /organizations/:organizationId/service-staff/assign - should return 401 without authentication', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/service-staff/assign`)
      .send({
        serviceId: service.id,
        staffId: employee.id,
      })

    expect(response.statusCode).toBe(401)
  })

  it('[POST] /organizations/:organizationId/service-staff/assign - should return 403 for non-admin user', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/service-staff/assign`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        serviceId: service.id,
        staffId: employee.id,
      })

    expect(response.statusCode).toBe(403)
  })

  it('[POST] /organizations/:organizationId/service-staff/assign - should return 404 when service does not exist', async () => {
    const organization = await makeOrganization(prisma)
    const employee = await makeEmployee(prisma, organization.id)
    const admin = await makeAdmin(prisma, organization.id)
    const fakeServiceId = '01HMVVQXYXNQBPQVGZPFX3YV8Q'
    const { token } = await authenticate(prisma, {
      userId: admin.id,
      role: 'admin',
    })

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/service-staff/assign`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        serviceId: fakeServiceId,
        staffId: employee.id,
      })

    expect(response.statusCode).toBe(404)
  })
})
