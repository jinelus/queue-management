import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { makeOrganization } from '../../factories/make-organization'
import { makeEmployee } from '../../factories/make-user'
import { prisma } from '../../setup-e2e'
import { authenticate } from '../../utils/authenticate'

describe('Get Organization by Slug (E2E)', () => {
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

  it('[GET] /organizations/by-slug/:slug - should get organization by slug', async () => {
    const organization = await makeOrganization(prisma, {
      name: 'Test Organization',
    })
    const employee = await makeEmployee(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .get(`/organizations/by-slug/${organization.slug}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.organization).toEqual({
      id: organization.id,
      name: 'Test Organization',
      slug: organization.slug,
      description: organization.description,
      logoUrl: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      logo: null,
      metadata: null,
    })
  })

  it('[GET] /organizations/by-slug/:slug - should return 401 without authentication', async () => {
    const organization = await makeOrganization(prisma)

    const response = await request(app.getHttpServer()).get(
      `/organizations/by-slug/${organization.slug}`,
    )

    expect(response.statusCode).toBe(401)
  })

  it('[GET] /organizations/by-slug/:slug - should return 404 when organization does not exist', async () => {
    const organization = await makeOrganization(prisma)
    const employee = await makeEmployee(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .get('/organizations/by-slug/non-existent-slug')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(404)
  })
})
