import {
  FindTicketsParams,
  TicketRepository,
} from '@/domain/master/application/repositories/ticket.repository'
import { Ticket } from '@/domain/master/entreprise/entities/ticket'

export class InMemoryTicketRepository implements TicketRepository {
  public items: Ticket[] = []

  async create(entity: Ticket): Promise<void> {
    this.items.push(entity)
  }

  async save(entity: Ticket): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === entity.id.toString())
    if (index >= 0) {
      this.items[index] = entity
    }
  }

  async findById(id: string): Promise<Ticket | null> {
    const ticket = this.items.find((item) => item.id.toString() === id)
    return ticket || null
  }

  async findAll(organizationId: string): Promise<Ticket[]> {
    return this.items.filter((item) => item.organizationId === organizationId)
  }

  async delete(entity: Ticket): Promise<void> {
    this.items = this.items.filter((item) => item.id.toString() !== entity.id.toString())
  }

  async count(organizationId: string, params?: FindTicketsParams): Promise<number> {
    const { serviceId, servedById, search, status } = params ?? {}
    return this.items.filter((item) => {
      const matchesOrganization = item.organizationId === organizationId
      const matchesService = serviceId ? item.serviceId === serviceId : true
      const matchesServedBy = servedById ? item.servedById === servedById : true
      const matchesStatus = status ? item.status === status : true
      const matchesSearch = search
        ? item.guestName.toLowerCase().includes(search.toLowerCase())
        : true
      return (
        matchesOrganization && matchesService && matchesServedBy && matchesStatus && matchesSearch
      )
    }).length
  }

  async findTickets(organizationId: string, params?: FindTicketsParams): Promise<Ticket[]> {
    const { serviceId, servedById, search, status, page, perPage, order, orderBy } = params ?? {}

    let filtered = this.items.filter((item) => {
      const matchesOrganization = item.organizationId === organizationId
      const matchesService = serviceId ? item.serviceId === serviceId : true
      const matchesServedBy = servedById ? item.servedById === servedById : true
      const matchesStatus = status ? item.status === status : true
      const matchesSearch = search
        ? item.guestName.toLowerCase().includes(search.toLowerCase())
        : true
      return (
        matchesOrganization && matchesService && matchesServedBy && matchesStatus && matchesSearch
      )
    })

    // Sort
    if (orderBy) {
      filtered = filtered.sort((a, b) => {
        const aVal = a[orderBy as keyof Ticket]
        const bVal = b[orderBy as keyof Ticket]
        if (aVal < bVal) return order === 'asc' ? -1 : 1
        if (aVal > bVal) return order === 'asc' ? 1 : -1
        return 0
      })
    }

    // Paginate
    if (page && perPage) {
      const start = (page - 1) * perPage
      filtered = filtered.slice(start, start + perPage)
    }

    return filtered
  }

  async findOldestWaiting(serviceId: string): Promise<Ticket | null> {
    const waiting = this.items
      .filter((item) => item.serviceId === serviceId && item.status === 'WAITING')
      .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime())

    return waiting[0] || null
  }

  async countPreceding(serviceId: string, joinedAt: Date): Promise<number> {
    return this.items.filter(
      (item) =>
        item.serviceId === serviceId &&
        item.status === 'WAITING' &&
        item.joinedAt.getTime() < joinedAt.getTime(),
    ).length
  }

  async getServedTicketsCountByDay(
    organizationId: string,
    days: number,
  ): Promise<{ date: string; count: number }[]> {
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    startDate.setDate(startDate.getDate() - (days - 1))

    const served = this.items.filter(
      (item) =>
        item.organizationId === organizationId &&
        item.status === 'SERVED' &&
        item.completedAt &&
        item.completedAt >= startDate,
    )

    const grouped = served.reduce(
      (acc, ticket) => {
        if (ticket.completedAt) {
          const dateKey = ticket.completedAt.toISOString().split('T')[0]
          acc[dateKey] = (acc[dateKey] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  async getAverageServiceDuration(
    organizationId: string,
  ): Promise<{ employeeId: string; employeeName: string; avgDuration: number }[]> {
    const served = this.items.filter(
      (item) =>
        item.organizationId === organizationId &&
        item.status === 'SERVED' &&
        item.startedAt &&
        item.completedAt &&
        item.servedById,
    )

    const grouped = served.reduce(
      (acc, ticket) => {
        const employeeId = ticket.servedById
        if (employeeId && ticket.completedAt && ticket.startedAt) {
          if (!acc[employeeId]) {
            acc[employeeId] = { total: 0, count: 0 }
          }
          const duration = (ticket.completedAt.getTime() - ticket.startedAt.getTime()) / 1000
          acc[employeeId].total += duration
          acc[employeeId].count += 1
        }
        return acc
      },
      {} as Record<string, { total: number; count: number }>,
    )

    return Object.entries(grouped).map(([employeeId, { total, count }]) => ({
      employeeId,
      employeeName: employeeId, // In-memory doesn't have user join, test should set this up
      avgDuration: Math.round(total / count),
    }))
  }
}
