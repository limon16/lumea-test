import type { NextConfig } from 'next';

const mediaOrigins = [
  process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://127.0.0.1:1337',
  ...(process.env.IMAGE_ORIGINS ?? '').split(',').filter(Boolean),
];
const remotePatterns = mediaOrigins.map((origin) => {
  const url = new URL(origin.trim());
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Image origins must use HTTP or HTTPS.');
  return { protocol: url.protocol.slice(0, -1) as 'http' | 'https', hostname: url.hostname, port: url.port, pathname: '/**' };
});

const config: NextConfig = { images: { remotePatterns } };
export default config;
