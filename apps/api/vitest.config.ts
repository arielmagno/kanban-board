import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/helpers/setup.ts'],
    testTimeout: 15000,
    hookTimeout: 30000,
    sequence: { concurrent: false },
  },
  resolve: {
    alias: {
      '@boardflow/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
});
