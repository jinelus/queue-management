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

  const rawDocument = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
    operationIdFactory: (controllerKey: string) => controllerKey,
  })

  const document = cleanupOpenApiDoc(rawDocument, {
    version: '3.1',
  })

  // Update OpenAPI version to 3.1.0 to match the cleanup output format
  document.openapi = '3.1.0'

  writeFileSync('swagger.json', JSON.stringify(document))
  process.exit()
}
bootstrap()
