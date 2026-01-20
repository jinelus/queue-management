export class NotAllowedError extends Error {
  constructor(text?: string) {
    super(text || 'Not allowed')
  }
}
