import swc from 'unplugin-swc'
import tsConfigPaths from 'vite-tsconfig-paths'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  test: {
    globals: true,
    root: './',
    exclude: [...configDefaults.exclude],
    pool: 'forks',
    sequence: {
      shuffle: !process.env.CI,
    },
    coverage: {
      provider: 'v8',
    },
  },
})
