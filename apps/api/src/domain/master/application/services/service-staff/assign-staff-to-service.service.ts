import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { NotAllowedError } from "@/core/errors/not-allowed-error";
import { NotFoundError } from "@/core/errors/not-found-error";
import { ServiceStaff } from "@/domain/master/entreprise/entities/service-staff";
import { PermissionFactory } from "../../permissions/permission.factory";
import { ServiceStaffRepository } from "../../repositories/service-staff.repository";
import { ServiceRepository } from "../../repositories/service.repository";
import { UserRepository } from "../../repositories/user.repository";

interface AssignStaffToServiceParams {
  actorId: string;
  serviceId: string;
  userId: string;
}

type AssignStaffToServiceResponse = Either<
  NotAllowedError | NotFoundError | Error,
  {
    serviceStaff: ServiceStaff;
  }
>;

@Injectable()
export class AssignStaffToService {
  constructor(
    private readonly serviceStaffRepository: ServiceStaffRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly userRepository: UserRepository,
    private readonly permissionFactory: PermissionFactory,
  ) {}

  async execute({
    actorId,
    serviceId,
    userId,
  }: AssignStaffToServiceParams): Promise<AssignStaffToServiceResponse> {
    const { success } = await this.permissionFactory.userCan(
      "create",
      "serviceStaff",
      {
        userId: actorId,
      },
    );

    if (!success) {
      return left(new NotAllowedError());
    }

    const service = await this.serviceRepository.findById(serviceId);
    if (!service) {
      return left(new NotFoundError("Service not found"));
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      return left(new NotFoundError("User not found"));
    }

    const existing = await this.serviceStaffRepository.findByPair(
      serviceId,
      userId,
    );
    if (existing) {
      if (!existing.active) {
        existing.active = true;
        await this.serviceStaffRepository.save(existing);
        return right({ serviceStaff: existing });
      }
      return left(new Error("Staff already assigned"));
    }

    const serviceStaff = ServiceStaff.create({
      serviceId,
      userId,
      active: true,
    });

    await this.serviceStaffRepository.create(serviceStaff);

    return right({ serviceStaff });
  }
}
