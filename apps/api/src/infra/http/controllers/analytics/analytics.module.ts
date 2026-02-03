import { Module } from '@nestjs/common'
import { PermissionFactory } from '@/domain/master/application/permissions/permission.factory'
import { GetDashboardSummaryService } from '@/domain/master/application/services/analytics/get-dashboard-summary.service'
import { GetHistoricalStatsService } from '@/domain/master/application/services/analytics/get-historical-stats.service'
import { DatabaseModule } from '@/infra/database/database.module'
import { GetAnalyticsController } from './get-analytics.controller'
import { GetDashboardSummaryController } from './get-dashboard-summary.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [GetAnalyticsController, GetDashboardSummaryController],
  providers: [PermissionFactory, GetHistoricalStatsService, GetDashboardSummaryService],
})
export class AnalyticsModule {}
