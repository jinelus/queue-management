import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/infra/database/database.module";
import { EnvModule } from "../env/env.module";
import { QueueEventsListener } from "./queue/listeners/queue-events.listener";

@Module({
  imports: [EnvModule, DatabaseModule],
  providers: [QueueEventsListener],
  exports: [QueueEventsListener],
})
export class EventsModule {}
