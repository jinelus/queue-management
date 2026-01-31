import { Module } from '@nestjs/common'
import { EnvModule } from '../env/env.module'
import { QueueEventsListener } from './queue/listeners/queue-events.listener'

@Module({
  imports: [EnvModule],
  providers: [QueueEventsListener],
  exports: [QueueEventsListener],
})
export class EventsModule {}
