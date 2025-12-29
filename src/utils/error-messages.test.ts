import { describe, it, expect } from 'vitest';
import { formatError, formatErrorShort } from './error-messages';

describe('error-messages', () => {
  describe('formatError', () => {
    describe('file system errors', () => {
      it('should map "permission denied" error correctly', () => {
        const result = formatError('EACCES: permission denied, open /etc/passwd');
        expect(result).toBe('Permission denied. Try running the app with appropriate permissions or check file ownership.');
      });

      it('should map "file not found" error correctly', () => {
        const result = formatError('ENOENT: no such file or directory');
        expect(result).toBe('File not found. The file may have been moved or deleted.');
      });

      it('should map "cannot find" error correctly', () => {
        const result = formatError('Cannot find the specified file');
        expect(result).toBe('File not found. The file may have been moved or deleted.');
      });

      it('should map "is a directory" error correctly', () => {
        const result = formatError('EISDIR: path is a directory');
        expect(result).toBe('Expected a file but found a directory');
      });

      it('should map "directory not empty" error correctly', () => {
        const result = formatError('ENOTEMPTY: directory not empty');
        expect(result).toBe('Cannot delete non-empty directory');
      });

      it('should map "read-only" error correctly', () => {
        const result = formatError('EROFS: read-only file system');
        expect(result).toBe('File is read-only. Check file permissions or remove the read-only flag.');
      });

      it('should map "disk full" error correctly', () => {
        const result = formatError('ENOSPC: no space left on device');
        expect(result).toBe('Disk is full. Free up disk space and try again.');
      });

      it('should map "file in use" error correctly', () => {
        const result = formatError('File is in use by another process');
        expect(result).toBe('File is in use by another process. Close other applications that may be using this file.');
      });

      it('should map "file locked" error correctly', () => {
        const result = formatError('The file is locked');
        expect(result).toBe('File is in use by another process. Close other applications that may be using this file.');
      });
    });

    describe('JSON/parse errors', () => {
      it('should map "unexpected token" (JSON) error correctly', () => {
        const result = formatError('SyntaxError: Unexpected token } in JSON at position 10');
        expect(result).toBe('Invalid JSON syntax. Check the file for syntax errors like missing commas or brackets.');
      });

      it('should map "unexpected end of input" error correctly', () => {
        const result = formatError('SyntaxError: Unexpected end of input');
        expect(result).toBe('Invalid JSON syntax. Check the file for syntax errors like missing commas or brackets.');
      });

      it('should map "JSON.parse" error correctly', () => {
        const result = formatError('JSON.parse: expected property name');
        expect(result).toBe('Invalid JSON syntax. Check the file for syntax errors like missing commas or brackets.');
      });

      it('should map "parse error at line" error correctly', () => {
        const result = formatError('Parse error at line 15');
        expect(result).toBe('Syntax error in file');
      });

      it('should map "invalid format" error correctly', () => {
        const result = formatError('Invalid format: expected YAML');
        expect(result).toBe('Invalid file format. Ensure the file is in the correct format.');
      });

      it('should map "malformed" error correctly', () => {
        const result = formatError('Malformed configuration file');
        expect(result).toBe('Invalid file format. Ensure the file is in the correct format.');
      });
    });

    describe('network errors', () => {
      it('should map network error correctly', () => {
        const result = formatError('Network request failed');
        expect(result).toBe('Network connection error. Check your internet connection and try again.');
      });

      it('should map connection error correctly', () => {
        const result = formatError('Connection refused');
        expect(result).toBe('Network connection error. Check your internet connection and try again.');
      });

      it('should map ECONNREFUSED error correctly', () => {
        const result = formatError('ECONNREFUSED');
        expect(result).toBe('Network connection error. Check your internet connection and try again.');
      });

      it('should map timeout error correctly', () => {
        const result = formatError('Request timeout');
        expect(result).toBe('Network connection error. Check your internet connection and try again.');
      });
    });

    describe('path errors', () => {
      it('should map "path too long" error correctly', () => {
        const result = formatError('ENAMETOOLONG: path too long');
        expect(result).toBe('File path is too long. Try moving the file to a shorter path.');
      });

      it('should map "invalid path" error correctly', () => {
        const result = formatError('Invalid path: contains null bytes');
        expect(result).toBe('Invalid file path. Check for special characters in the file path.');
      });

      it('should map "illegal path" error correctly', () => {
        const result = formatError('Illegal path characters detected');
        expect(result).toBe('Invalid file path. Check for special characters in the file path.');
      });
    });

    describe('context handling', () => {
      it('should prepend context when provided', () => {
        const result = formatError('permission denied', 'Failed to save file');
        expect(result).toBe('Failed to save file: Permission denied. Try running the app with appropriate permissions or check file ownership.');
      });

      it('should prepend context with fallback error', () => {
        const result = formatError('Some unknown error', 'Operation failed');
        expect(result).toBe('Operation failed: Some unknown error');
      });
    });

    describe('error type handling', () => {
      it('should handle Error objects (extracts message)', () => {
        const error = new Error('permission denied');
        const result = formatError(error);
        expect(result).toBe('Permission denied. Try running the app with appropriate permissions or check file ownership.');
      });

      it('should handle string errors', () => {
        const result = formatError('no such file or directory');
        expect(result).toBe('File not found. The file may have been moved or deleted.');
      });

      it('should handle null gracefully', () => {
        const result = formatError(null);
        expect(result).toBe('null');
      });

      it('should handle undefined gracefully', () => {
        const result = formatError(undefined);
        expect(result).toBe('undefined');
      });

      it('should handle number errors', () => {
        const result = formatError(404);
        expect(result).toBe('404');
      });

      it('should handle object errors', () => {
        const result = formatError({ code: 'ERROR' });
        expect(result).toBe('[object Object]');
      });
    });

    describe('fallback behavior', () => {
      it('should fall back to original error string for unknown patterns', () => {
        const result = formatError('Some completely unknown error message');
        expect(result).toBe('Some completely unknown error message');
      });

      it('should fall back with context for unknown patterns', () => {
        const result = formatError('Unknown error', 'Failed');
        expect(result).toBe('Failed: Unknown error');
      });
    });

    describe('action hints', () => {
      it('should include action hint for errors that have one', () => {
        const result = formatError('permission denied');
        expect(result).toContain('Try running the app');
      });

      it('should not include action hint for errors without one', () => {
        const result = formatError('is a directory');
        expect(result).toBe('Expected a file but found a directory');
        expect(result).not.toContain('.');
      });
    });

    describe('case insensitivity', () => {
      it('should match patterns case-insensitively', () => {
        expect(formatError('PERMISSION DENIED')).toContain('Permission denied');
        expect(formatError('Permission Denied')).toContain('Permission denied');
        expect(formatError('permission DENIED')).toContain('Permission denied');
      });
    });
  });

  describe('formatErrorShort', () => {
    describe('known error mapping', () => {
      it('should map known errors without action hints', () => {
        const result = formatErrorShort('permission denied');
        expect(result).toBe('Permission denied');
        expect(result).not.toContain('Try running');
      });

      it('should map file not found without action hint', () => {
        const result = formatErrorShort('no such file or directory');
        expect(result).toBe('File not found');
      });

      it('should map JSON error without action hint', () => {
        const result = formatErrorShort('unexpected token in JSON');
        expect(result).toBe('Invalid JSON syntax');
      });
    });

    describe('context handling', () => {
      it('should prepend context when provided', () => {
        const result = formatErrorShort('permission denied', 'Save failed');
        expect(result).toBe('Save failed: Permission denied');
      });

      it('should prepend context for unknown errors', () => {
        const result = formatErrorShort('unknown error', 'Operation failed');
        expect(result).toBe('Operation failed: unknown error');
      });
    });

    describe('truncation', () => {
      it('should truncate long error messages to 100 chars + "..."', () => {
        const longError = 'A'.repeat(150);
        const result = formatErrorShort(longError);
        expect(result).toBe('A'.repeat(100) + '...');
        expect(result.length).toBe(103);
      });

      it('should not truncate short messages', () => {
        const shortError = 'Short error message';
        const result = formatErrorShort(shortError);
        expect(result).toBe(shortError);
      });

      it('should not truncate messages exactly at 100 chars', () => {
        const exactError = 'A'.repeat(100);
        const result = formatErrorShort(exactError);
        expect(result).toBe(exactError);
        expect(result.length).toBe(100);
      });

      it('should not truncate known error patterns (they are already short)', () => {
        const result = formatErrorShort('A very long permission denied error message that goes on and on');
        expect(result).toBe('Permission denied');
      });
    });

    describe('error type handling', () => {
      it('should handle Error objects', () => {
        const error = new Error('permission denied');
        const result = formatErrorShort(error);
        expect(result).toBe('Permission denied');
      });

      it('should handle null gracefully', () => {
        const result = formatErrorShort(null);
        expect(result).toBe('null');
      });

      it('should handle undefined gracefully', () => {
        const result = formatErrorShort(undefined);
        expect(result).toBe('undefined');
      });
    });

    describe('truncation with context', () => {
      it('should add context before truncated message', () => {
        const longError = 'B'.repeat(150);
        const result = formatErrorShort(longError, 'Error');
        expect(result).toBe('Error: ' + 'B'.repeat(100) + '...');
      });
    });
  });
});
