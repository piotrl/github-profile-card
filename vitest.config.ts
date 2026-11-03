import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      name: 'stub-styles',
      enforce: 'pre',
      resolveId: (id) => (/\.s?css$/.test(id) ? `\0${id}` : undefined),
      load: (id) => (/\.s?css$/.test(id) ? 'export default {}' : undefined),
    },
  ],
  test: {
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/testing/test-setup.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/testing/**', 'src/css/**'],
      thresholds: { branches: 85, functions: 90, lines: 90, statements: 90 },
    },
  },
});
