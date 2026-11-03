import { vi, type Mock } from 'vitest';
import { ApiProfile, ApiRepository } from '../interface/IGitHubApi';

export interface MockResponse {
  status: number;
  headers?: {
    get: Mock;
  };
  json?: Mock;
}

/**
 * Global fetch mock function
 */
export const mockFetch = vi.fn<(...args: unknown[]) => Promise<unknown>>();

/**
 * Sets up the global fetch mock
 */
export function setupFetchMock(): void {
  (globalThis as any).fetch = mockFetch;
}

/**
 * Creates a successful HTTP response mock
 */
export function createSuccessResponse<T>(
  data: T,
  headers: Record<string, string> = {},
): MockResponse {
  return {
    status: 200,
    headers: {
      get: vi.fn((header: string) => headers[header] || null),
    },
    json: vi.fn<() => Promise<unknown>>().mockResolvedValue(data),
  };
}

/**
 * Creates an error HTTP response mock
 */
export function createErrorResponse(
  status: number,
  message: string,
  headers: Record<string, string> = {},
): MockResponse {
  return {
    status,
    headers: {
      get: vi.fn((header: string) => headers[header] || null),
    },
    json: vi.fn<() => Promise<unknown>>().mockResolvedValue({ message }),
  };
}

/**
 * Creates a 304 Not Modified response mock
 */
export function createNotModifiedResponse(): MockResponse {
  return {
    status: 304,
  };
}

/**
 * Creates a network error for fetch
 */
export function createNetworkError(message: string = 'Network failure'): Error {
  return new Error(message);
}

/**
 * Creates a JSON parsing error for fetch
 */
export function createJsonError(message: string = 'Invalid JSON'): Error {
  return new Error(message);
}

/**
 * Resets the fetch mock
 */
export function resetFetchMock(): void {
  mockFetch.mockReset();
}

/**
 * Sets up common fetch mock responses for user data loading
 */
export function setupUserDataMocks(
  profile: ApiProfile,
  repositories: ApiRepository[],
): void {
  mockFetch
    .mockResolvedValueOnce(
      createSuccessResponse(profile, {
        'Last-Modified': 'Mon, 18 Mar 2019 20:40:35 GMT',
      }),
    )
    .mockResolvedValueOnce(
      createSuccessResponse(repositories, {
        'Last-Modified': 'Mon, 18 Mar 2019 20:40:35 GMT',
      }),
    );
}

/**
 * Sets up language loading mocks for repositories
 */
export function setupLanguageMocks(
  languageStats: Record<string, number>[],
): void {
  languageStats.forEach((stats) => {
    mockFetch.mockResolvedValueOnce(createSuccessResponse(stats));
  });
}
