import { writeFileSync } from 'node:fs'

import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { cleanupOpenApiDoc } from 'nestjs-zod'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .addBearerAuth({ type: 'http' })
    .setTitle('Queue management')
    .setDescription('A queue management API')
    .setVersion('1.0')
    .build()

  const document = cleanupOpenApiDoc(
    SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
      operationIdFactory: (controllerKey: string, _: string) => controllerKey,
    }),
    {
      version: '3.1',
    },
  )

  writeFileSync('swagger.json', JSON.stringify(document))
  process.exit()
}
bootstrap()
