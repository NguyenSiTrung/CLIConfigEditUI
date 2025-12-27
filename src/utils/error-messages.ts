/**
 * Error message utilities for user-friendly error display
 */

interface ErrorMapping {
  pattern: RegExp;
  message: string;
  action?: string;
}

const errorMappings: ErrorMapping[] = [
  // File system errors
  {
    pattern: /permission denied/i,
    message: 'Permission denied',
    action: 'Try running the app with appropriate permissions or check file ownership.',
  },
  {
    pattern: /no such file|file not found|cannot find/i,
    message: 'File not found',
    action: 'The file may have been moved or deleted.',
  },
  {
    pattern: /is a directory/i,
    message: 'Expected a file but found a directory',
  },
  {
    pattern: /directory not empty/i,
    message: 'Cannot delete non-empty directory',
  },
  {
    pattern: /read-only|readonly/i,
    message: 'File is read-only',
    action: 'Check file permissions or remove the read-only flag.',
  },
  {
    pattern: /disk.*full|no space left/i,
    message: 'Disk is full',
    action: 'Free up disk space and try again.',
  },
  {
    pattern: /file.*in use|file.*locked|being used/i,
    message: 'File is in use by another process',
    action: 'Close other applications that may be using this file.',
  },

  // JSON/Parse errors
  {
    pattern: /unexpected token|unexpected end of input|json.parse/i,
    message: 'Invalid JSON syntax',
    action: 'Check the file for syntax errors like missing commas or brackets.',
  },
  {
    pattern: /expected.*at line|parse error at line/i,
    message: 'Syntax error in file',
  },
  {
    pattern: /invalid.*format|malformed/i,
    message: 'Invalid file format',
    action: 'Ensure the file is in the correct format.',
  },

  // Network errors (for future use)
  {
    pattern: /network|connection|timeout|ECONNREFUSED/i,
    message: 'Network connection error',
    action: 'Check your internet connection and try again.',
  },

  // Path errors
  {
    pattern: /path.*too long/i,
    message: 'File path is too long',
    action: 'Try moving the file to a shorter path.',
  },
  {
    pattern: /invalid.*path|illegal.*path/i,
    message: 'Invalid file path',
    action: 'Check for special characters in the file path.',
  },
];

/**
 * Get a user-friendly error message for a backend error
 * @param error The error object or string from the backend
 * @param context Optional context to prepend (e.g., "Failed to save")
 * @returns A user-friendly error message
 */
export function formatError(error: unknown, context?: string): string {
  const errorString = error instanceof Error ? error.message : String(error);
  
  // Check against known patterns
  for (const mapping of errorMappings) {
    if (mapping.pattern.test(errorString)) {
      const base = context ? `${context}: ${mapping.message}` : mapping.message;
      return mapping.action ? `${base}. ${mapping.action}` : base;
    }
  }
  
  // Default: return the original error with context
  if (context) {
    return `${context}: ${errorString}`;
  }
  return errorString;
}

/**
 * Get a short user-friendly error message (for toasts)
 * @param error The error object or string
 * @param context Optional context to prepend
 * @returns A short, user-friendly error message
 */
export function formatErrorShort(error: unknown, context?: string): string {
  const errorString = error instanceof Error ? error.message : String(error);
  
  // Check against known patterns
  for (const mapping of errorMappings) {
    if (mapping.pattern.test(errorString)) {
      return context ? `${context}: ${mapping.message}` : mapping.message;
    }
  }
  
  // Default: return the original error with context (truncated if too long)
  const maxLength = 100;
  const trimmedError = errorString.length > maxLength 
    ? errorString.substring(0, maxLength) + '...'
    : errorString;
  
  return context ? `${context}: ${trimmedError}` : trimmedError;
}
