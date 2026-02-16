import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { makeOrganization } from '../../factories/make-organization'
import { makeEmployee } from '../../factories/make-user'
import { prisma } from '../../setup-e2e'
import { authenticate } from '../../utils/authenticate'

describe('Get Analytics (E2E)', () => {
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

  it('[GET] /organizations/:organizationId/analytics - should get analytics', async () => {
    const organization = await makeOrganization(prisma)
    const employee = await makeEmployee(prisma, organization.id)
    console.log(employee)
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    console.log(token)

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/analytics`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('servedTicketsByDay')
    expect(response.body).toHaveProperty('avgDurationByEmployee')
    expect(response.body.servedTicketsByDay).toBeInstanceOf(Array)
    expect(response.body.avgDurationByEmployee).toBeInstanceOf(Array)
  })

  it('[GET] /organizations/:organizationId/analytics - should support days parameter', async () => {
    const organization = await makeOrganization(prisma)
    const employee = await makeEmployee(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    console.log(token)

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/analytics`)
      .query({ days: 30 })
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.servedTicketsByDay).toBeInstanceOf(Array)
  })

  it('[GET] /organizations/:organizationId/analytics - should return 401 without authentication', async () => {
    const organization = await makeOrganization(prisma)

    const response = await request(app.getHttpServer()).get(
      `/organizations/${organization.id}/analytics`,
    )

    expect(response.statusCode).toBe(401)
  })
})
