import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "@/infra/app.module";
import { prisma } from "../../setup-e2e";
import { makeOrganization } from "../../factories/make-organization";
import { makeService } from "../../factories/make-service";

describe("Create Ticket (E2E)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("[POST] /organizations/:organizationId/tickets", async () => {
    const organization = await makeOrganization(prisma);
    const service = await makeService(prisma, organization.id);

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/tickets`)
      .send({
        guestName: "John Doe",
        serviceId: service.id,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.ticket).toEqual({
      id: expect.any(String),
      guestName: "John Doe",
      status: "WAITING",
      callCount: 0,
      organizationId: organization.id,
      serviceId: service.id,
      joinedAt: expect.any(String),
    });
    // Optional fields should not be present when null
    expect(response.body.ticket).not.toHaveProperty("servedById");
    expect(response.body.ticket).not.toHaveProperty("calledAt");
    expect(response.body.ticket).not.toHaveProperty("startedAt");
    expect(response.body.ticket).not.toHaveProperty("completedAt");
  });

  it("[POST] /organizations/:organizationId/tickets - should return 404 when organization does not exist", async () => {
    const fakeOrganizationId = "01HMVVQXYXNQBPQVGZPFX3YV8Q";
    const fakeServiceId = "01HMVVQXYXNQBPQVGZPFX3YV8R";

    const response = await request(app.getHttpServer())
      .post(`/organizations/${fakeOrganizationId}/tickets`)
      .send({
        guestName: "John Doe",
        serviceId: fakeServiceId,
      });

    expect(response.statusCode).toBe(404);
  });

  it("[POST] /organizations/:organizationId/tickets - should return 404 when service does not exist", async () => {
    const organization = await makeOrganization(prisma);
    const fakeServiceId = "01HMVVQXYXNQBPQVGZPFX3YV8Q";

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/tickets`)
      .send({
        guestName: "John Doe",
        serviceId: fakeServiceId,
      });

    expect(response.statusCode).toBe(404);
  });

  it("[POST] /organizations/:organizationId/tickets - should return 400 when guest name is empty", async () => {
    const organization = await makeOrganization(prisma);
    const service = await makeService(prisma, organization.id);

    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/tickets`)
      .send({
        guestName: "",
        serviceId: service.id,
      });

    expect(response.statusCode).toBe(400);
  });
});
