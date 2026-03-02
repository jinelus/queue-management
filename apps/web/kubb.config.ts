import type { UserConfig } from '@kubb/core'
import { pluginClient } from '@kubb/plugin-client'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'

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
      dataReturnType: 'full',
      importPath: '@/lib/api-client',
    }),
  ],
}

export default config
