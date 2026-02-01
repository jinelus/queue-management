import { IoAdapter } from '@nestjs/platform-socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import { ServerOptions } from 'socket.io'

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>
  private pubClient: ReturnType<typeof createClient>
  private subClient: ReturnType<typeof createClient>

  async connectToRedis(): Promise<void> {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined in environment variables')
    }

    this.pubClient = createClient({ url: redisUrl })
    this.subClient = this.pubClient.duplicate()

    this.pubClient.on('error', (err) => console.error('Redis Pub Client Error:', err))
    this.subClient.on('error', (err) => console.error('Redis Sub Client Error:', err))

    await Promise.all([this.pubClient.connect(), this.subClient.connect()])

    this.adapterConstructor = createAdapter(this.pubClient, this.subClient)
  }

  async disconnect(): Promise<void> {
    await Promise.all([this.pubClient.destroy(), this.subClient.destroy()])
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options)
    server.adapter(this.adapterConstructor)
    return server
  }
}
