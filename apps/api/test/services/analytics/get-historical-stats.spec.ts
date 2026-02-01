/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { TicketRepository } from '@/domain/master/application/repositories/ticket.repository'
import { GetHistoricalStatsService } from '@/domain/master/application/services/analytics/get-historical-stats.service'

describe('GetHistoricalStatsService', () => {
  let sut: GetHistoricalStatsService
  let ticketRepository: TicketRepository
  let permissionFactory: PermissionFactory

  beforeEach(() => {
    ticketRepository = {
      getServedTicketsCountByDay: vi.fn(),
      getAverageServiceDuration: vi.fn(),
    } as any
    permissionFactory = {
      userCan: vi.fn(),
    } as any

    sut = new GetHistoricalStatsService(ticketRepository, permissionFactory)
  })

  it('should be able to get historical stats', async () => {
    const servedStats = [{ date: '2023-01-01', count: 10 }]
    const durationStats = [{ employeeId: 'emp-1', employeeName: 'John', avgDuration: 120 }]

    vi.spyOn(permissionFactory, 'userCan').mockResolvedValue({
      success: true,
      error: undefined,
    })
    vi.spyOn(ticketRepository, 'getServedTicketsCountByDay').mockResolvedValue(servedStats)
    vi.spyOn(ticketRepository, 'getAverageServiceDuration').mockResolvedValue(durationStats)

    const result = await sut.execute({
      organizationId: 'org-1',
      userId: 'user-1',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.servedTicketsByDay).toEqual(servedStats)
      expect(result.value.avgDurationByEmployee).toEqual(durationStats)
    }
  })

  it('should not be able to get stats if permission denied', async () => {
    vi.spyOn(permissionFactory, 'userCan').mockResolvedValue({
      success: false,
      error: undefined,
    })

    const result = await sut.execute({
      organizationId: 'org-1',
      userId: 'user-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
