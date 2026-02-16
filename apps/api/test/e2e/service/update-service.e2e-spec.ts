import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { makeOrganization } from '../../factories/make-organization'
import { makeService } from '../../factories/make-service'
import { makeAdmin } from '../../factories/make-user'
import { prisma } from '../../setup-e2e'
import { authenticate } from '../../utils/authenticate'

describe('Update Service (E2E)', () => {
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

  it('[PUT] /organizations/:organizationId/services/:serviceId - should update service', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id, {
      name: 'Old Name',
    })
    const admin = await makeAdmin(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: admin.id,
      role: 'admin',
    })

    const response = await request(app.getHttpServer())
      .put(`/organizations/${organization.id}/services/${service.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Name',
        description: 'Updated description',
        avgDurationInt: 20,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.service.name).toBe('New Name')
    expect(response.body.service.description).toBe('Updated description')
    expect(response.body.service.avgDurationInt).toBe(20)
  })

  it('[PUT] /organizations/:organizationId/services/:serviceId - should return 401 without authentication', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)

    const response = await request(app.getHttpServer())
      .put(`/organizations/${organization.id}/services/${service.id}`)
      .send({
        name: 'New Name',
      })

    expect(response.statusCode).toBe(401)
  })

  it('[PUT] /organizations/:organizationId/services/:serviceId - should return 404 when service does not exist', async () => {
    const organization = await makeOrganization(prisma)
    const admin = await makeAdmin(prisma, organization.id)
    const fakeServiceId = '01HMVVQXYXNQBPQVGZPFX3YV8Q'
    const { token } = await authenticate(prisma, {
      userId: admin.id,
      role: 'admin',
    })

    const response = await request(app.getHttpServer())
      .put(`/organizations/${organization.id}/services/${fakeServiceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Name',
      })

    expect(response.statusCode).toBe(404)
  })
})
