import { Repository } from "@/core/repositories/repository";
import { Organization } from "../../entreprise/entities/organization";

export abstract class OrganizationRepository extends Repository<Organization> {
  abstract findBySlug(slug: string): Promise<Organization | null>;
}
