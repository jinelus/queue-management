import swc from 'unplugin-swc'
import tsConfigPaths from 'vite-tsconfig-paths'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
    exclude: [...configDefaults.exclude],
    setupFiles: ['./test/setup-e2e.ts'],
    testTimeout: 15000,
    hookTimeout: 1000000,
    teardownTimeout: 5000,
    pool: 'forks',
    coverage: {
      provider: 'v8',
    },
  },
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
})
