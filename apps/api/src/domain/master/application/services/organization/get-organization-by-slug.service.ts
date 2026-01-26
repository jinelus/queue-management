import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { NotFoundError } from "@/core/errors/not-found-error";
import { Organization } from "@/domain/master/entreprise/entities/organization";
import { OrganizationRepository } from "../../repositories/organization.repository";

interface GetOrganizationBySlugServiceParams {
  slug: string;
}

type GetOrganizationBySlugServiceResponse = Either<
  NotFoundError,
  {
    organization: Organization;
  }
>;

@Injectable()
export class GetOrganizationBySlugService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute({
    slug,
  }: GetOrganizationBySlugServiceParams): Promise<GetOrganizationBySlugServiceResponse> {
    const organization = await this.organizationRepository.findBySlug(slug);

    if (!organization) {
      return left(new NotFoundError());
    }

    return right({
      organization,
    });
  }
}
