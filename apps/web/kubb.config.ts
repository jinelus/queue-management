import type { UserConfig } from '@kubb/core'
import { pluginClient } from '@kubb/plugin-client'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginZod } from '@kubb/plugin-zod'

const config: UserConfig = {
  root: '.',
  input: {
    path: '../api/swagger.json',
  },
  output: {
    path: './src/gen',
    clean: true,
  },
  plugins: [
    pluginOas(),
    pluginTs({
      output: {
        path: './types',
      },
    }),
    pluginClient({
      output: {
        path: './clients',
      },
      client: 'fetch',
      dataReturnType: 'full',
      importPath: './src/lib/api-client',
    }),
    pluginZod({
      output: {
        path: './zod',
      },
    }),
  ],
}

export default config
