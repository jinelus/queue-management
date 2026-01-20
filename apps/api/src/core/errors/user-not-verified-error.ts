export class UserNotVerifiedError extends Error {
  constructor() {
    super('Email do usuário não foi verificado')
  }
}
