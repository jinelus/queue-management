import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { env } from '@repo/env'
import { apiReference } from '@scalar/nestjs-api-reference'
import { cleanupOpenApiDoc } from 'nestjs-zod'
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

  const config = new DocumentBuilder()
    .addBearerAuth({ type: 'http' })
    .setTitle('Queue management')
    .setDescription('A queue management API')
    .setVersion('1.0')
    .build()

  const document = cleanupOpenApiDoc(
    SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
      operationIdFactory: (controllerKey: string) => controllerKey,
    }),
    {
      version: '3.1',
    },
  )

  app.use(
    '/scalar',
    apiReference({
      content: document,
      persistAuth: true,
      theme: 'bluePlanet',
    }),
  )

  SwaggerModule.setup('swagger', app, document)

  await app.listen(port)
}
bootstrap()
