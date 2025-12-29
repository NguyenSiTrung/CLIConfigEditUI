import { vi } from 'vitest';

type InvokeHandler = (cmd: string, args?: Record<string, unknown>) => unknown;

let mockHandler: InvokeHandler | null = null;

export const mockInvoke = vi.fn(async (cmd: string, args?: Record<string, unknown>) => {
  if (mockHandler) {
    return mockHandler(cmd, args);
  }
  throw new Error(`invoke not mocked for command: ${cmd}`);
});

export function mockInvokeSuccess<T>(responses: Record<string, T | ((args?: Record<string, unknown>) => T)>): void {
  mockHandler = (cmd: string, args?: Record<string, unknown>) => {
    if (cmd in responses) {
      const response = responses[cmd];
      if (typeof response === 'function') {
        return (response as (args?: Record<string, unknown>) => T)(args);
      }
      return response;
    }
    throw new Error(`Unmocked command: ${cmd}`);
  };
  mockInvoke.mockImplementation(async (cmd: string, args?: Record<string, unknown>) => {
    return mockHandler!(cmd, args);
  });
}

export function mockInvokeError(error: string | Error): void {
  const err = typeof error === 'string' ? new Error(error) : error;
  mockHandler = () => {
    throw err;
  };
  mockInvoke.mockImplementation(async () => {
    throw err;
  });
}

export function mockInvokeOnce<T>(response: T | Error): void {
  if (response instanceof Error) {
    mockInvoke.mockImplementationOnce(async () => {
      throw response;
    });
  } else {
    mockInvoke.mockImplementationOnce(async () => response);
  }
}

export function mockInvokeSequence<T>(responses: (T | Error)[]): void {
  responses.forEach((response) => {
    mockInvokeOnce(response);
  });
}

export function resetMocks(): void {
  mockHandler = null;
  mockInvoke.mockReset();
}

export function clearMockCalls(): void {
  mockInvoke.mockClear();
}

vi.mock('@tauri-apps/api/core', () => ({
  invoke: mockInvoke,
}));
