import { defineConfig } from 'vitest/config';
import path from 'path';
import { config } from 'dotenv';

const env = config({ path: path.resolve(__dirname, '.env.test') }).parsed ?? {};

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    fileParallelism: false,
    setupFiles: ['./tests/helpers/setup.ts'],
    env,
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
