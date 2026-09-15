import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Component tests render into a DOM; the pure-function suites do not care.
    environment: 'jsdom',
  },
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
});
