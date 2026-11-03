import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'https://piotrl.github.io/github-profile-card' },
    },
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/testing/test-setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/testing/**', 'src/css.d.ts'],
      thresholds: { branches: 85, functions: 90, lines: 90, statements: 90 },
    },
  },
});
