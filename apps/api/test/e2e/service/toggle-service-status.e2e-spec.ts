import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { makeOrganization } from '../../factories/make-organization'
import { makeService } from '../../factories/make-service'
import { makeAdmin } from '../../factories/make-user'
import { prisma } from '../../setup-e2e'
import { authenticate } from '../../utils/authenticate'

describe('Toggle Service Status (E2E)', () => {
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

  it('[PATCH] /organizations/:organizationId/services/:serviceId/toggle-status - should deactivate service', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id, {
      isActive: true,
    })
    const admin = await makeAdmin(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: admin.id,
      role: 'admin',
    })

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organization.id}/services/${service.id}/toggle-status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        isActive: false,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.service.isActive).toBe(false)
  })

  it('[PATCH] /organizations/:organizationId/services/:serviceId/toggle-status - should activate service', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id, {
      isActive: false,
    })
    const admin = await makeAdmin(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: admin.id,
      role: 'admin',
    })

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organization.id}/services/${service.id}/toggle-status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        isActive: true,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.service.isActive).toBe(true)
  })

  it('[PATCH] /organizations/:organizationId/services/:serviceId/toggle-status - should return 401 without authentication', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organization.id}/services/${service.id}/toggle-status`)
      .send({
        isActive: false,
      })

    expect(response.statusCode).toBe(401)
  })

  it('[PATCH] /organizations/:organizationId/services/:serviceId/toggle-status - should return 404 when service does not exist', async () => {
    const organization = await makeOrganization(prisma)
    const admin = await makeAdmin(prisma, organization.id)
    const fakeServiceId = '01HMVVQXYXNQBPQVGZPFX3YV8Q'
    const { token } = await authenticate(prisma, {
      userId: admin.id,
      role: 'admin',
    })

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organization.id}/services/${fakeServiceId}/toggle-status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        isActive: false,
      })

    expect(response.statusCode).toBe(404)
  })
})
