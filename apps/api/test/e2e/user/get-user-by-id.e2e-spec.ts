import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { makeOrganization } from '../../factories/make-organization'
import { makeEmployee } from '../../factories/make-user'
import { prisma } from '../../setup-e2e'
import { authenticate } from '../../utils/authenticate'

describe('Get User by ID (E2E)', () => {
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

  it('[GET] /organizations/:organizationId/users/by-id - should get current user', async () => {
    const organization = await makeOrganization(prisma)
    const employee = await makeEmployee(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/users/by-id`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.user).toEqual({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      emailVerified: true,
      organizationId: organization.id,
      image: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      banned: false,
      banReason: null,
      banExpires: null,
    })
  })

  it('[GET] /organizations/:organizationId/users/by-id - should get specific user by targetUserId', async () => {
    const organization = await makeOrganization(prisma)
    const employee = await makeEmployee(prisma, organization.id)
    const targetUser = await makeEmployee(prisma, organization.id)
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/users/by-id`)
      .query({ targetUserId: targetUser.id })
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.user.id).toBe(targetUser.id)
  })

  it('[GET] /organizations/:organizationId/users/by-id - should return 401 without authentication', async () => {
    const organization = await makeOrganization(prisma)

    const response = await request(app.getHttpServer()).get(
      `/organizations/${organization.id}/users/by-id`,
    )

    expect(response.statusCode).toBe(401)
  })

  it('[GET] /organizations/:organizationId/users/by-id - should return 404 when target user does not exist', async () => {
    const organization = await makeOrganization(prisma)
    const employee = await makeEmployee(prisma, organization.id)
    const fakeUserId = '01HMVVQXYXNQBPQVGZPFX3YV8Q'
    const { token } = await authenticate(prisma, {
      userId: employee.id,
      role: 'employee',
    })

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/users/by-id`)
      .query({ targetUserId: fakeUserId })
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toBe(404)
  })
})
