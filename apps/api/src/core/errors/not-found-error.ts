export class NotFoundError extends Error {
  constructor(text?: string) {
    super(text || 'Resource Not Found')
  }
}
