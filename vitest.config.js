import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.js', 'tests/**/*.test.js', 'tests/**/*.spec.js'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.config.js', 'tests/mocks/**']
    },
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    deps: {
      interopDefault: true,
      inline: [/pinia/]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'uni': path.resolve(__dirname, './tests/mocks/uni.js'),
      '@dcloudio/uni-app': path.resolve(__dirname, './tests/mocks/uni.js')
    }
  }
})
