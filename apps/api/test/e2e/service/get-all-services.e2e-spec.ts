import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { makeOrganization } from '../../factories/make-organization'
import { makeService } from '../../factories/make-service'
import { prisma } from '../../setup-e2e'

describe('Get All Services (E2E)', () => {
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

  it('[GET] /organizations/:organizationId/services - should get all services', async () => {
    const organization = await makeOrganization(prisma)
    await makeService(prisma, organization.id, { name: 'Service A' })
    await makeService(prisma, organization.id, { name: 'Service B' })
    await makeService(prisma, organization.id, { name: 'Service C' })

    const response = await request(app.getHttpServer()).get(
      `/organizations/${organization.id}/services`,
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.services).toHaveLength(3)
    expect(response.body.total).toBe(3)
    expect(response.body.services[0]).toHaveProperty('id')
    expect(response.body.services[0]).toHaveProperty('name')
  })

  it('[GET] /organizations/:organizationId/services - should support pagination', async () => {
    const organization = await makeOrganization(prisma)
    await makeService(prisma, organization.id)
    await makeService(prisma, organization.id)
    await makeService(prisma, organization.id)

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/services`)
      .query({ page: 1, perPage: 2 })

    expect(response.statusCode).toBe(200)
    expect(response.body.services).toHaveLength(2)
    expect(response.body.total).toBe(3)
  })

  it('[GET] /organizations/:organizationId/services - should support search', async () => {
    const organization = await makeOrganization(prisma)
    await makeService(prisma, organization.id, { name: 'Customer Support' })
    await makeService(prisma, organization.id, { name: 'Technical Help' })
    await makeService(prisma, organization.id, { name: 'Billing' })

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/services`)
      .query({ search: 'Support' })

    expect(response.statusCode).toBe(200)
    expect(response.body.services).toHaveLength(1)
    expect(response.body.services[0].name).toBe('Customer Support')
  })

  it('[GET] /organizations/:organizationId/services - should return 404 when organization does not exist', async () => {
    const fakeOrganizationId = '01HMVVQXYXNQBPQVGZPFX3YV8Q'

    const response = await request(app.getHttpServer()).get(
      `/organizations/${fakeOrganizationId}/services`,
    )

    expect(response.statusCode).toBe(404)
  })
})
