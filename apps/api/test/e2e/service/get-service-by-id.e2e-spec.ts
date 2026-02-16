import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { makeOrganization } from '../../factories/make-organization'
import { makeService } from '../../factories/make-service'
import { prisma } from '../../setup-e2e'

describe('Get Service by ID (E2E)', () => {
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

  it('[GET] /organizations/:organizationId/services/by-id/:serviceId - should get service by id', async () => {
    const organization = await makeOrganization(prisma)
    const service = await makeService(prisma, organization.id, {
      name: 'Test Service',
      description: 'Test Description',
    })

    const response = await request(app.getHttpServer()).get(
      `/organizations/${organization.id}/services/by-id/${service.id}`,
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.service).toEqual({
      id: service.id,
      name: 'Test Service',
      description: 'Test Description',
      avgDurationInt: expect.any(Number),
      maxCapacity: expect.any(Number),
      alertThresholdMinutes: expect.any(Number),
      isActive: true,
      organizationId: organization.id,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })
  })

  it('[GET] /organizations/:organizationId/services/by-id/:serviceId - should return 404 when service does not exist', async () => {
    const organization = await makeOrganization(prisma)
    const fakeServiceId = '01HMVVQXYXNQBPQVGZPFX3YV8Q'

    const response = await request(app.getHttpServer()).get(
      `/organizations/${organization.id}/services/by-id/${fakeServiceId}`,
    )

    expect(response.statusCode).toBe(404)
  })
})
