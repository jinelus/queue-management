import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/not-found-error'
import { User } from '@/domain/master/entreprise/entities/user'
import { OrganizationRepository } from '../../repositories/organization.repository'
import { UserRepository } from '../../repositories/user.repository'

interface GetUserByIdServiceParams {
  userId: string
  organizationId: string
}

type GetUserByIdServiceResponse = Either<
  NotFoundError,
  {
    user: User
  }
>

@Injectable()
export class GetUserByIdService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute({
    userId,
    organizationId,
  }: GetUserByIdServiceParams): Promise<GetUserByIdServiceResponse> {
    const organization = await this.organizationRepository.findById(organizationId)

    if (!organization) {
      return left(new NotFoundError('Organization not found'))
    }

    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new NotFoundError('User not found'))
    }

    return right({
      user,
    })
  }
}
