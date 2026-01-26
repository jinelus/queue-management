import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { NotAllowedError } from "@/core/errors/not-allowed-error";
import { NotFoundError } from "@/core/errors/not-found-error";
import { Service } from "@/domain/master/entreprise/entities/service";
import { PermissionFactory } from "../../permissions/permission.factory";
import { ServiceRepository } from "../../repositories/service.repository";

interface ToggleServiceStatusServiceParams {
  serviceId: string;
  isActive: boolean;
  userId: string;
}

type ToggleServiceStatusServiceResponse = Either<
  NotAllowedError | NotFoundError,
  {
    service: Service;
  }
>;

@Injectable()
export class ToggleServiceStatusService {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly permissionFactory: PermissionFactory,
  ) {}

  async execute({
    serviceId,
    isActive,
    userId,
  }: ToggleServiceStatusServiceParams): Promise<ToggleServiceStatusServiceResponse> {
    const { success } = await this.permissionFactory.userCan(
      "update",
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

    service.isActive = isActive;

    await this.serviceRepository.save(service);

    return right({
      service,
    });
  }
}
