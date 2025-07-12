module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
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
  
  // Test patterns
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/src/**/*.test.ts',
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/testing/test-setup.ts'],
  
  // Module name mapping for CSS imports
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/src/testing/style-mock.js',
  },
  
  // Transform configuration
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
};
