import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server'

export const searchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  q: parseAsString.withDefault(''),
}
export const loadServicesSearchParams = createLoader(searchParams)
