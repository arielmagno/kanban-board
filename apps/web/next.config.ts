import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve.alias['@boardflow/shared'] = path.resolve(
      __dirname,
      '../../packages/shared/src/index.ts',
    );
    return config;
  },
};

export default nextConfig;
