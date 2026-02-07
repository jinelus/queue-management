import { Module } from '@nestjs/common'
import { DatabaseModule } from '@/infra/database/database.module'
import { WebSocketBroadcaster } from '@/infra/http/gateway/websocket/websocket-broadcaster.service'
import { EnvModule } from '../env/env.module'
import { QueueEventsListener } from './queue/listeners/queue-events.listener'

@Module({
  imports: [EnvModule, DatabaseModule],
  providers: [QueueEventsListener, WebSocketBroadcaster],
  exports: [QueueEventsListener, WebSocketBroadcaster],
})
export class EventsModule {}
