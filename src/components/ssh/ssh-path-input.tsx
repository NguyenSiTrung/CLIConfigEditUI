import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import type { SshConnectionStatus, SshStatusResult } from '@/types';
import { testSshHost, isValidSshPath } from '@/utils/ssh';
import { Button, Input } from '@/components/ui';

interface SshPathInputProps {
  value: string;
  onChange: (value: string) => void;
  onConnectionStatusChange?: (status: SshConnectionStatus, error?: string) => void;
  disabled?: boolean;
}

export function SshPathInput({
  value,
  onChange,
  onConnectionStatusChange,
  disabled = false,
}: SshPathInputProps) {
  const [status, setStatus] = useState<SshConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [hasTestedOnce, setHasTestedOnce] = useState(false);

  const updateStatus = (newStatus: SshConnectionStatus, newError?: string) => {
    setStatus(newStatus);
    setError(newError || null);
    onConnectionStatusChange?.(newStatus, newError);
  };

  const handleTestConnection = async () => {
    if (!value.trim() || !isValidSshPath(value)) {
      updateStatus('error', 'Invalid SSH path format. Use: user@host:/path or host:/path');
      return;
    }

    setIsTesting(true);
    updateStatus('checking');

    try {
      const result: SshStatusResult = await testSshHost(value);
      setHasTestedOnce(true);

      if (result.status === 'connected') {
        updateStatus('connected');
      } else if (result.status === 'error') {
        updateStatus('error', result.error);
      } else {
        updateStatus('disconnected');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      updateStatus('error', errorMsg);
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    if (!value.trim()) {
      setStatus('disconnected');
      setError(null);
      setHasTestedOnce(false);
    }
  }, [value]);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'checking':
        return <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Connection failed';
      case 'checking':
        return 'Testing...';
      default:
        return 'Not tested';
    }
  };

  const isValid = isValidSshPath(value);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          SSH Path *
        </label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="user@hostname:/path/to/config.json"
          disabled={disabled}
          className="font-mono"
        />
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Format: <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">user@host:/path</code>,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">host:/path</code>, or{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">user@host:port:/path</code>
        </p>
      </div>

      {value.trim() && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`text-sm ${
              status === 'connected' 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : status === 'error'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-600 dark:text-slate-400'
            }`}>
              {getStatusText()}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleTestConnection}
            disabled={disabled || isTesting || !isValid}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isTesting ? 'animate-spin' : ''}`} />
            {hasTestedOnce ? 'Retest' : 'Test Connection'}
          </Button>
        </div>
      )}

      {error && status === 'error' && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <p className="text-xs text-red-500 dark:text-red-400/70 mt-1">
            Ensure SSH keys are set up and the host is accessible.
          </p>
        </div>
      )}

      {!isValid && value.trim() && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Invalid format. SSH path should contain a colon separating host from path.
        </p>
      )}
    </div>
  );
}
