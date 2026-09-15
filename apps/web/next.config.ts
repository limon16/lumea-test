import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '127.0.0.1', port: '1337' },
      { protocol: 'http', hostname: 'localhost', port: '1337' },
    ],
  },
};

export default config;
