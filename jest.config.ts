import { Config } from 'jest';
import { createDefaultPreset } from 'ts-jest';

const presetConfig = createDefaultPreset({
  useESM: true,
});

const config: Config = {
  ...presetConfig,
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'https://piotrl.github.io/github-profile-card',
  },
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/src/testing/style-mock.js',
  },
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/testing/**',
    '!src/css/**',
  ],
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/testing/test-setup.ts'],
};

export default config;
