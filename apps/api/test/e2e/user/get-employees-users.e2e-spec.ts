import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { makeOrganization } from '../../factories/make-organization'
import { makeEmployee } from '../../factories/make-user'
import { prisma } from '../../setup-e2e'
import { authenticate } from '../../utils/authenticate'

describe('Get Employees Users (E2E)', () => {
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

  it('[GET] /organizations/:organizationId/users/employees - should get employees', async () => {
    const organization = await makeOrganization(prisma)
    const employee = await makeEmployee(prisma, organization.id)
    await makeEmployee(prisma, organization.id)
    await makeEmployee(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/users/employees`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.users).toBeInstanceOf(Array)
    expect(response.body.users.length).toBeGreaterThanOrEqual(3)
    expect(response.body.total).toBeGreaterThanOrEqual(3)
  })

  it('[GET] /organizations/:organizationId/users/employees - should support pagination', async () => {
    const organization = await makeOrganization(prisma)
    const employee = await makeEmployee(prisma, organization.id)
    await makeEmployee(prisma, organization.id)
    await makeEmployee(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/users/employees`)
      .query({ page: 1, perPage: 2 })
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.users).toHaveLength(2)
  })

  it('[GET] /organizations/:organizationId/users/employees - should support search', async () => {
    const organization = await makeOrganization(prisma)
    const searchName = `John Doe ${Date.now()}`
    const employee = await makeEmployee(prisma, organization.id, {
      name: searchName,
    })
    await makeEmployee(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/users/employees`)
      .query({ search: 'John Doe' })
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.users.length).toBeGreaterThanOrEqual(1)
  })

  it('[GET] /organizations/:organizationId/users/employees - should return 401 without authentication', async () => {
    const organization = await makeOrganization(prisma)

    const response = await request(app.getHttpServer()).get(
      `/organizations/${organization.id}/users/employees`,
    )

    expect(response.statusCode).toBe(401)
  })
})
