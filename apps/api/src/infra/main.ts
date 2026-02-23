/** biome-ignore-all lint/correctness/useHookAtTopLevel: <> */

import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger'
import { env } from '@repo/env'
import { apiReference } from '@scalar/nestjs-api-reference'
import { cleanupOpenApiDoc } from 'nestjs-zod'
import { AppModule } from './app.module'
import { EnvService } from './env/env.service'
import { RedisIoAdapter } from './http/adapters/redis-io.adapter'
import { auth } from '@/auth'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    cors: {
      origin: env.NEXT_PUBLIC_FRONT_END_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    },
  })
  
  const configService = app.get(EnvService)
  const port = configService.get('PORT')

  const redisIoAdapter = new RedisIoAdapter(app)
  await redisIoAdapter.connectToRedis()
  app.useWebSocketAdapter(redisIoAdapter)

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
        version: '3.0',
      },
    )
  
    const betterAuthSchema = await auth.api.generateOpenAPISchema()

  const allDocuments: OpenAPIObject = {
  ...document,
  paths: {
    ...document.paths,
    ...betterAuthSchema.paths,
  },
  components: {
    ...document.components,
    schemas: {
      ...document.components?.schemas,
      ...betterAuthSchema.components?.schemas,
    },
    securitySchemes: {
      ...document.components?.securitySchemes,
      ...betterAuthSchema.components?.securitySchemes,
    },
  },
} as OpenAPIObject

  app.use(
    '/scalar',
    apiReference({
      content: allDocuments,
      persistAuth: true,
      theme: 'bluePlanet',
    }),
  )

  SwaggerModule.setup('swagger', app, allDocuments)

  await app.listen(port)
}
bootstrap()
