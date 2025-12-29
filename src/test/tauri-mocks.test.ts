import { describe, it, expect, beforeEach } from 'vitest';
import { mockInvoke, mockInvokeSuccess, mockInvokeError, mockInvokeOnce, resetMocks } from './tauri-mocks';

describe('tauri-mocks', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('mockInvokeSuccess', () => {
    it('returns mocked response for command', async () => {
      mockInvokeSuccess({
        get_data: { value: 42 },
      });

      const result = await mockInvoke('get_data');
      expect(result).toEqual({ value: 42 });
    });

    it('supports function handlers for dynamic responses', async () => {
      mockInvokeSuccess({
        get_item: (args?: Record<string, unknown>) => ({ id: args?.id, name: 'test' }),
      });

      const result = await mockInvoke('get_item', { id: 'abc' });
      expect(result).toEqual({ id: 'abc', name: 'test' });
    });

    it('throws for unmocked commands', async () => {
      mockInvokeSuccess({
        known_command: 'ok',
      });

      await expect(mockInvoke('unknown_command')).rejects.toThrow('Unmocked command: unknown_command');
    });
  });

  describe('mockInvokeError', () => {
    it('throws error for all commands', async () => {
      mockInvokeError('Test error');

      await expect(mockInvoke('any_command')).rejects.toThrow('Test error');
    });

    it('accepts Error object', async () => {
      mockInvokeError(new Error('Custom error'));

      await expect(mockInvoke('any_command')).rejects.toThrow('Custom error');
    });
  });

  describe('mockInvokeOnce', () => {
    it('mocks single invocation', async () => {
      mockInvokeOnce('first');
      mockInvokeOnce('second');

      expect(await mockInvoke('get_value')).toBe('first');
      expect(await mockInvoke('get_value')).toBe('second');
    });

    it('throws Error when response is Error', async () => {
      mockInvokeOnce(new Error('Failed'));

      await expect(mockInvoke('fail_command')).rejects.toThrow('Failed');
    });
  });

  describe('resetMocks', () => {
    it('clears all mock implementations', async () => {
      mockInvokeSuccess({ test: 'value' });
      expect(await mockInvoke('test')).toBe('value');

      resetMocks();
      mockInvokeError('invoke not mocked');

      await expect(mockInvoke('test')).rejects.toThrow('invoke not mocked');
    });

    it('resets call history', async () => {
      mockInvokeSuccess({ cmd: 'result' });
      
      await mockInvoke('cmd');
      await mockInvoke('cmd');
      expect(mockInvoke).toHaveBeenCalledTimes(2);

      resetMocks();
      expect(mockInvoke).toHaveBeenCalledTimes(0);
    });
  });
});
