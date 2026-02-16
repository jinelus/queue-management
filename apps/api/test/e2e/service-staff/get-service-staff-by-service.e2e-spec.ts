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

describe('Get Service Staff by Service (E2E)', () => {
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

  it('[POST] /organizations/:organizationId/services/:serviceId/service-staff - should get service staff', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    await makeServiceStaff(prisma, employee.id, service.id)
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/services/${service.id}/service-staff`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(201)
    expect(response.body.servicesStaff).toBeInstanceOf(Array)
    expect(response.body.servicesStaff).toHaveLength(1)
    expect(response.body.servicesStaff[0].serviceId).toBe(service.id)
    expect(response.body.servicesStaff[0].userId).toBe(employee.id)
  })

  it('[POST] /organizations/:organizationId/services/:serviceId/service-staff - should return empty array when no staff assigned', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/services/${service.id}/service-staff`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(201)
    expect(response.body.servicesStaff).toEqual([])
  })

  it('[POST] /organizations/:organizationId/services/:serviceId/service-staff - should return 401 without authentication', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)

    const response = await request(app.getHttpServer()).post(
      `/organizations/${organization.id}/services/${service.id}/service-staff`,
    )

    expect(response.statusCode).toBe(401)
  })

  it('[POST] /organizations/:organizationId/services/:serviceId/service-staff - should return 404 when service does not exist', async () => {
    const organization = await makeOrganization(prisma)
    const employee = await makeEmployee(prisma, organization.id)
    const fakeServiceId = '01HMVVQXYXNQBPQVGZPFX3YV8Q'
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/services/${fakeServiceId}/service-staff`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(404)
  })
})
