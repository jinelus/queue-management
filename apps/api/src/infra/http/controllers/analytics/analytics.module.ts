import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/infra/database/database.module";
import { GetHistoricalStatsService } from "@/domain/master/application/services/analytics/get-historical-stats.service";
import { GetAnalyticsController } from "./get-analytics.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [GetAnalyticsController],
  providers: [GetHistoricalStatsService],
})
export class AnalyticsModule {}
