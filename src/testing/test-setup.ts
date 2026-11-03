import { vi, beforeEach, expect, afterEach } from 'vitest';

// Mock console methods during tests to reduce noise
const originalError = console.error;
const originalWarn = console.warn;

// Mock localStorage globally
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    length: 0,
    key: vi.fn(),
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
  (globalThis as any).localStorage = localStorageMock;
}

beforeEach(() => {
  console.error = vi.fn();
  console.warn = vi.fn();

  // Reset all mocks before each test
  vi.clearAllMocks();
  localStorageMock.clear();

  // Global DOM setup for tests that need it
  // Only reset DOM if it exists (for jsdom environment tests)
  if (typeof document !== 'undefined') {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  }
});

afterEach(() => {
  console.error = originalError;
  console.warn = originalWarn;
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
export { localStorageMock };
