import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./lib/__tests__/setup.ts'],
    include: ['lib/__tests__/**/*.test.ts', 'lib/__tests__/**/*.test.tsx'],
    exclude: ['node_modules', '.next'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
