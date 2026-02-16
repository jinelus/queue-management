import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { makeOrganization } from '../../factories/make-organization'
import { makeService } from '../../factories/make-service'
import { makeAdmin } from '../../factories/make-user'
import { prisma } from '../../setup-e2e'
import { authenticate } from '../../utils/authenticate'

describe('Delete Service (E2E)', () => {
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

  it('[DELETE] /organizations/:organizationId/services/:serviceId - should delete service', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)
    const admin = await makeAdmin(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: admin.id,
      role: 'admin',
    })

    const response = await request(app.getHttpServer())
      .delete(`/organizations/${organization.id}/services/${service.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.message).toBe('Service deleted successfully')

    // Verify service was deleted
    const serviceOnDb = await prisma.service.findUnique({
      where: { id: service.id },
    })
    expect(serviceOnDb).toBeNull()
  })

  it('[DELETE] /organizations/:organizationId/services/:serviceId - should return 401 without authentication', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id)

    const response = await request(app.getHttpServer()).delete(
      `/organizations/${organization.id}/services/${service.id}`,
    )

    expect(response.statusCode).toBe(401)
  })

  it('[DELETE] /organizations/:organizationId/services/:serviceId - should return 404 when service does not exist', async () => {
    const organization = await makeOrganization(prisma)
    const admin = await makeAdmin(prisma, organization.id)
    const fakeServiceId = '01HMVVQXYXNQBPQVGZPFX3YV8Q'
    const { token } = await authenticate(prisma, {
      userId: admin.id,
      role: 'admin',
    })

    const response = await request(app.getHttpServer())
      .delete(`/organizations/${organization.id}/services/${fakeServiceId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(404)
  })
})
