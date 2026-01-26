import { Repository } from "@/core/repositories/repository";
import { ServiceStaff } from "../../entreprise/entities/service-staff";

export abstract class ServiceStaffRepository extends Repository<ServiceStaff> {
  abstract findByServiceId(serviceId: string): Promise<ServiceStaff[]>;
  abstract findByUserId(userId: string): Promise<ServiceStaff[]>;
  abstract findByPair(
    serviceId: string,
    userId: string,
  ): Promise<ServiceStaff | null>;
}
