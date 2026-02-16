import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { makeOrganization } from '../../factories/make-organization'
import { makeAdmin, makeEmployee } from '../../factories/make-user'
import { prisma } from '../../setup-e2e'
import { authenticate } from '../../utils/authenticate'

describe('Create Service (E2E)', () => {
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

  it('[POST] /organizations/:organizationId/services - should create a service', async () => {
    const organization = await makeOrganization(prisma)
    const admin = await makeAdmin(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: admin.id,
      role: 'admin',
    })

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/services`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Customer Support',
        description: 'Customer support service',
        avgDurationInt: 15,
        maxCapacity: 50,
        isActive: true,
      })

    expect(response.statusCode).toBe(201)
    expect(response.body.service).toEqual({
      id: expect.any(String),
      name: 'Customer Support',
      description: 'Customer support service',
      avgDurationInt: 15,
      maxCapacity: 50,
      alertThresholdMinutes: expect.any(Number),
      isActive: true,
      organizationId: organization.id,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })
  })

  it('[POST] /organizations/:organizationId/services - should return 401 without authentication', async () => {
    const organization = await makeOrganization(prisma)

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/services`)
      .send({
        name: 'Customer Support',
      })

    expect(response.statusCode).toBe(401)
  })

  it('[POST] /organizations/:organizationId/services - should return 403 for non-admin user', async () => {
    const organization = await makeOrganization(prisma)
    const employee = await makeEmployee(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/services`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Customer Support',
      })

    expect(response.statusCode).toBe(403)
  })

  it('[POST] /organizations/:organizationId/services - should return 404 when organization does not exist', async () => {
    const organization = await makeOrganization(prisma)
    const admin = await makeAdmin(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: admin.id,
      role: 'admin',
    })

    const fakeOrganizationId = '01HMVVQXYXNQBPQVGZPFX3YV8Q'
    const response = await request(app.getHttpServer())
      .post(`/organizations/${fakeOrganizationId}/services`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Customer Support',
      })

    expect(response.statusCode).toBe(404)
  })

  it('[POST] /organizations/:organizationId/services - should return 400 for invalid data', async () => {
    const organization = await makeOrganization(prisma)
    const admin = await makeAdmin(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: admin.id,
      role: 'admin',
    })

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/services`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: '',
      })

    expect(response.statusCode).toBe(400)
  })
})
