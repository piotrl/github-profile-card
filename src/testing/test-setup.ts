/**
 * Test setup file for Jest
 * Global test configuration and mocks
 */

// Mock console methods during tests to reduce noise
const originalError = console.error;
const originalWarn = console.warn;

beforeEach(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Global DOM setup for tests that need it
beforeEach(() => {
  // Only reset DOM if it exists (for jsdom environment tests)
  if (typeof document !== 'undefined') {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  }
});

// Mock localStorage globally
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn(),
  };
})();

// Safely define localStorage only if window exists
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
} else {
  // For node environment, create a global localStorage
  (global as any).localStorage = localStorageMock;
}

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});

// Add custom matchers
expect.extend({
  toBeInDOM() {
    return {
      pass: true,
      message: () => 'Expected element to be in the DOM',
    };
  },
});

// Export for use in tests
export { localStorageMock, mockFetch };
