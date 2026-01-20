export interface PaginationParams {
  page?: number
  perPage?: number
  search?: string
  orderBy: string
  order: 'asc' | 'desc'
}
