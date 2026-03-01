type Success<T> = [null, T]
type Failure<E> = [E, null]

export type ActionTuple<T, E = Error> = Success<T> | Failure<E>

export async function tryCatch<T, E = Error>(fn: () => Promise<T>): Promise<ActionTuple<T, E>> {
  try {
    const result = await fn()
    return [null, result]
  } catch (error) {
    return [error as E, null]
  }
}
