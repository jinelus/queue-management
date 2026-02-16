import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { makeOrganization } from '../../factories/make-organization'
import { makeService } from '../../factories/make-service'
import { makeTicket } from '../../factories/make-ticket'
import { makeAdmin, makeEmployee } from '../../factories/make-user'
import { prisma } from '../../setup-e2e'
import { authenticate } from '../../utils/authenticate'

describe('Get Dashboard Summary (E2E)', () => {
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

  it('[GET] /organizations/:organizationId/dashboard - should get dashboard summary', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const admin = await makeAdmin(prisma, organization.id)

    // Create some waiting tickets
    await makeTicket(prisma, organization.id, service.id, {
      status: 'WAITING',
    })
    await makeTicket(prisma, organization.id, service.id, {
      status: 'WAITING',
    })

    const { token } = await authenticate(prisma, {
      userId: admin.id,
      role: 'admin',
    })

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/dashboard`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('services')
    expect(response.body).toHaveProperty('totalWaiting')
    expect(response.body).toHaveProperty('totalActiveStaff')
    expect(response.body.services).toBeInstanceOf(Array)
    expect(response.body.totalWaiting).toBeGreaterThanOrEqual(2)
  })

  it('[GET] /organizations/:organizationId/dashboard - should return 401 without authentication', async () => {
    const organization = await makeOrganization(prisma)

    const response = await request(app.getHttpServer()).get(
      `/organizations/${organization.id}/dashboard`,
    )

    expect(response.statusCode).toBe(401)
  })

  it('[GET] /organizations/:organizationId/dashboard - should return 403 for non-admin user', async () => {
    const organization = await makeOrganization(prisma)
    const employee = await makeEmployee(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/dashboard`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(403)
  })
})
