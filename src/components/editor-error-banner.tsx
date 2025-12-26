import { AlertTriangle, X } from 'lucide-react';
import type { BackendError } from '@/types';

interface EditorErrorBannerProps {
  error: BackendError;
  onDismiss: () => void;
}

function getErrorTitle(errorType: string): string {
  switch (errorType) {
    case 'JsonParse':
      return 'JSON Parse Error';
    case 'PermissionDenied':
      return 'Permission Denied';
    case 'Io':
      return 'File Read Error';
    case 'PathResolution':
      return 'Path Resolution Error';
    default:
      return 'Error';
  }
}

function getErrorDescription(errorType: string): string {
  switch (errorType) {
    case 'JsonParse':
      return 'The file contains invalid JSON. Please fix the syntax error before editing.';
    case 'PermissionDenied':
      return 'Cannot read this file due to permission restrictions.';
    case 'Io':
      return 'An error occurred while reading the file.';
    case 'PathResolution':
      return 'Could not resolve the file path.';
    default:
      return 'An unexpected error occurred.';
  }
}

export function EditorErrorBanner({ error, onDismiss }: EditorErrorBannerProps) {
  const title = getErrorTitle(error.error_type);
  const description = getErrorDescription(error.error_type);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10">
      <div className="max-w-lg w-full mx-4 bg-red-950 border border-red-800 rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <div className="flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-red-200">{title}</h3>
            <p className="mt-1 text-sm text-red-300/80">{description}</p>
            <div className="mt-3 p-2 bg-red-900/50 rounded border border-red-800/50 overflow-auto max-h-32">
              <code className="text-xs text-red-200 whitespace-pre-wrap break-all font-mono">
                {error.message}
              </code>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-md hover:bg-red-800/50 transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
        <div className="px-4 py-3 bg-red-900/30 border-t border-red-800/50 flex justify-end">
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 text-sm font-medium text-red-200 bg-red-800 hover:bg-red-700 rounded-md transition-colors"
          >
            Acknowledge & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
