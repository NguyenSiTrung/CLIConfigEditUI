import { describe, it, expect } from 'vitest';
import { getFileName, getDirName, truncatePath } from './path';

describe('getFileName', () => {
  describe('Unix paths', () => {
    it('should return filename for simple Unix path', () => {
      expect(getFileName('/home/user/file.txt')).toBe('file.txt');
    });

    it('should return filename for nested Unix path', () => {
      expect(getFileName('/home/user/documents/projects/file.ts')).toBe('file.ts');
    });

    it('should return filename for root level file', () => {
      expect(getFileName('/file.txt')).toBe('file.txt');
    });
  });

  describe('Windows paths', () => {
    it('should return filename for Windows path', () => {
      expect(getFileName('C:\\Users\\file.txt')).toBe('file.txt');
    });

    it('should return filename for nested Windows path', () => {
      expect(getFileName('C:\\Users\\Documents\\Projects\\file.ts')).toBe('file.ts');
    });
  });

  describe('edge cases', () => {
    it('should return undefined for null', () => {
      expect(getFileName(null)).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(getFileName(undefined)).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      expect(getFileName('')).toBeUndefined();
    });

    it('should return undefined for path ending with separator', () => {
      expect(getFileName('/home/user/')).toBeUndefined();
    });

    it('should return undefined for Windows path ending with separator', () => {
      expect(getFileName('C:\\Users\\')).toBeUndefined();
    });

    it('should return filename for single filename without path', () => {
      expect(getFileName('file.txt')).toBe('file.txt');
    });

    it('should handle filename with multiple dots', () => {
      expect(getFileName('/home/user/file.test.ts')).toBe('file.test.ts');
    });

    it('should handle filename with spaces', () => {
      expect(getFileName('/home/user/my file.txt')).toBe('my file.txt');
    });
  });
});

describe('getDirName', () => {
  describe('Unix paths', () => {
    it('should return directory for simple Unix path', () => {
      expect(getDirName('/home/user/file.txt')).toBe('/home/user');
    });

    it('should return directory for nested Unix path', () => {
      expect(getDirName('/home/user/documents/projects/file.ts')).toBe('/home/user/documents/projects');
    });

    it('should return undefined for root level file', () => {
      expect(getDirName('/file.txt')).toBeUndefined();
    });
  });

  describe('Windows paths', () => {
    it('should return directory for Windows path', () => {
      expect(getDirName('C:\\Users\\file.txt')).toBe('C:\\Users');
    });

    it('should return directory for nested Windows path', () => {
      expect(getDirName('C:\\Users\\Documents\\Projects\\file.ts')).toBe('C:\\Users\\Documents\\Projects');
    });

    it('should preserve Windows separator', () => {
      const result = getDirName('C:\\Users\\Documents\\file.txt');
      expect(result).toBe('C:\\Users\\Documents');
      expect(result).toContain('\\');
    });
  });

  describe('edge cases', () => {
    it('should return undefined for null', () => {
      expect(getDirName(null)).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(getDirName(undefined)).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      expect(getDirName('')).toBeUndefined();
    });

    it('should return undefined for single filename without path', () => {
      expect(getDirName('file.txt')).toBeUndefined();
    });

    it('should handle directory with trailing separator', () => {
      expect(getDirName('/home/user/')).toBe('/home/user');
    });

    it('should handle path with spaces', () => {
      expect(getDirName('/home/my user/file.txt')).toBe('/home/my user');
    });
  });
});

describe('truncatePath', () => {
  describe('null/undefined handling', () => {
    it('should return empty string for null', () => {
      expect(truncatePath(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(truncatePath(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(truncatePath('')).toBe('');
    });
  });

  describe('short paths', () => {
    it('should return path unchanged if under default maxLength', () => {
      expect(truncatePath('/home/user/file.txt')).toBe('/home/user/file.txt');
    });

    it('should return path unchanged if exactly at maxLength', () => {
      const path = '/home/user/file.txt'; // 19 chars
      expect(truncatePath(path, 19)).toBe(path);
    });
  });

  describe('long paths', () => {
    it('should truncate with ellipsis for long paths', () => {
      const longPath = '/home/user/documents/projects/very/deep/nested/folder/file.txt';
      const result = truncatePath(longPath, 40);
      expect(result.length).toBeLessThanOrEqual(40);
      expect(result).toContain('…');
    });

    it('should preserve first and last parts', () => {
      const longPath = '/home/user/documents/projects/very/deep/nested/folder/file.txt';
      const result = truncatePath(longPath, 40);
      expect(result).toContain('/');
      expect(result).toContain('file.txt');
    });

    it('should use custom maxLength when provided', () => {
      const path = '/home/user/documents/projects/file.txt';
      const result = truncatePath(path, 30);
      expect(result.length).toBeLessThanOrEqual(30);
    });
  });

  describe('paths with 2 parts', () => {
    it('should handle path with only 2 parts', () => {
      const path = '/verylongdirectoryname/verylongfilename.txt';
      const result = truncatePath(path, 25);
      expect(result.length).toBeLessThanOrEqual(25);
      expect(result).toContain('…');
    });
  });

  describe('very long filenames', () => {
    it('should handle very long filename gracefully', () => {
      const path = '/home/user/this_is_a_very_long_filename_that_exceeds_the_limit.txt';
      const result = truncatePath(path, 40);
      expect(result.length).toBeLessThanOrEqual(40);
      expect(result).toContain('…');
    });

    it('should handle case where first+last parts exceed maxLength', () => {
      const path = '/very_long_directory_name/extremely_long_filename_here.txt';
      const result = truncatePath(path, 30);
      expect(result.length).toBeLessThanOrEqual(30);
      expect(result).toContain('…');
    });
  });

  describe('Windows paths', () => {
    it('should truncate Windows paths with backslash separator', () => {
      const longPath = 'C:\\Users\\Documents\\Projects\\Very\\Deep\\Nested\\Folder\\file.txt';
      const result = truncatePath(longPath, 40);
      expect(result.length).toBeLessThanOrEqual(40);
      expect(result).toContain('…');
    });

    it('should preserve Windows separator in truncated path', () => {
      const longPath = 'C:\\Users\\Documents\\Projects\\Very\\Deep\\file.txt';
      const result = truncatePath(longPath, 35);
      expect(result).toContain('\\');
    });
  });

  describe('edge cases for truncation', () => {
    it('should handle very small maxLength', () => {
      const path = '/home/user/file.txt';
      const result = truncatePath(path, 10);
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should include more trailing parts when space allows', () => {
      const path = '/home/a/b/c/d/file.txt';
      const result = truncatePath(path, 30);
      expect(result).toContain('file.txt');
    });
  });
});
