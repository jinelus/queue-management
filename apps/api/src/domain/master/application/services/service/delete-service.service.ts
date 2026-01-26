import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { NotAllowedError } from "@/core/errors/not-allowed-error";
import { NotFoundError } from "@/core/errors/not-found-error";
import { PermissionFactory } from "../../permissions/permission.factory";
import { ServiceRepository } from "../../repositories/service.repository";

interface DeleteServiceServiceParams {
  serviceId: string;
  userId: string;
}

type DeleteServiceServiceResponse = Either<
  NotAllowedError | NotFoundError,
  null
>;

@Injectable()
export class DeleteServiceService {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly permissionFactory: PermissionFactory,
  ) {}

  async execute({
    serviceId,
    userId,
  }: DeleteServiceServiceParams): Promise<DeleteServiceServiceResponse> {
    const { success } = await this.permissionFactory.userCan(
      "delete",
      "service",
      { userId },
    );

    if (!success) {
      return left(new NotAllowedError());
    }

    const service = await this.serviceRepository.findById(serviceId);

    if (!service) {
      return left(new NotFoundError());
    }

    await this.serviceRepository.delete(service);

    return right(null);
  }
}
