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

describe('Get Service Staff by Staff ID (E2E)', () => {
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

  it('[POST] /organizations/:organizationId/by-staff/service-staff - should get staff assignments', async () => {
    const organization = await makeOrganization(prisma)
    const service1 = await makeService(prisma, organization.id)
    const service2 = await makeService(prisma, organization.id)
    const employee = await makeEmployee(prisma, organization.id)
    await makeServiceStaff(prisma, employee.id, service1.id)
    await makeServiceStaff(prisma, employee.id, service2.id)
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/by-staff/service-staff`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(201)
    expect(response.body.servicesStaff).toBeInstanceOf(Array)
    expect(response.body.servicesStaff).toHaveLength(2)
  })

  it('[POST] /organizations/:organizationId/by-staff/service-staff - should return 401 without authentication', async () => {
    const organization = await makeOrganization(prisma)

    const response = await request(app.getHttpServer()).post(
      `/organizations/${organization.id}/by-staff/service-staff`,
    )

    expect(response.statusCode).toBe(401)
  })
})
