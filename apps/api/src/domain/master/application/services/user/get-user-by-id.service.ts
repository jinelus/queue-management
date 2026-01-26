import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { NotFoundError } from '@/core/errors/not-found-error'
import { User } from '@/domain/master/entreprise/entities/user'
import { UserRepository } from '../../repositories/user.repository'

interface GetUserByIdServiceParams {
  userId: string
}

type GetUserByIdServiceResponse = Either<
  NotFoundError,
  {
    user: User
  }
>

@Injectable()
export class GetUserByIdService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ userId }: GetUserByIdServiceParams): Promise<GetUserByIdServiceResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      left(new NotFoundError('User not found'))
    }

    return right({
      user,
    })
  }
}
