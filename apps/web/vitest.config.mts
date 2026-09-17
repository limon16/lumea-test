import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Тести компонентів рендерять у DOM; наборам чистих функцій середовище байдуже.
    environment: 'jsdom',
  },
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
});
