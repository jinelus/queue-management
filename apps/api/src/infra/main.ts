import { NestFactory } from '@nestjs/core'
import { env } from '@repo/env'
import { AppModule } from './app.module'
import { EnvService } from './env/env.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    cors: {
      origin: env.FRONT_END_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    },
  })

  const configService = app.get(EnvService)
  const port = configService.get('PORT')

  await app.listen(port)
}
bootstrap()
