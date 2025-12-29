import { useState, useCallback, useEffect, useRef } from 'react';
import type { SshConnectionStatus, SshStatusResult } from '../types';
import { testSshHost } from '../utils/ssh';

interface UseRemoteConnectionOptions {
  autoReconnect?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  checkInterval?: number;
}

interface UseRemoteConnectionReturn {
  status: SshConnectionStatus;
  error: string | null;
  lastChecked: number | null;
  testConnection: () => Promise<SshStatusResult>;
  reconnect: () => Promise<void>;
  isChecking: boolean;
}

export function useRemoteConnection(
  sshPath: string | null,
  options: UseRemoteConnectionOptions = {}
): UseRemoteConnectionReturn {
  const {
    autoReconnect = true,
    maxRetries = 3,
    retryDelay = 2000,
    checkInterval = 0,
  } = options;

  const [status, setStatus] = useState<SshConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const retriesRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const testConnection = useCallback(async (): Promise<SshStatusResult> => {
    if (!sshPath) {
      const result: SshStatusResult = { status: 'disconnected' };
      setStatus('disconnected');
      setError(null);
      return result;
    }

    setIsChecking(true);
    setStatus('checking');

    try {
      const result = await testSshHost(sshPath);
      setLastChecked(Date.now());

      if (result.status === 'connected') {
        setStatus('connected');
        setError(null);
        retriesRef.current = 0;
      } else if (result.status === 'error') {
        setStatus('error');
        setError(result.error || 'Connection failed');
      } else {
        setStatus('disconnected');
        setError(null);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setStatus('error');
      setError(errorMessage);
      return { status: 'error', error: errorMessage };
    } finally {
      setIsChecking(false);
    }
  }, [sshPath]);

  const reconnect = useCallback(async (): Promise<void> => {
    retriesRef.current = 0;
    await testConnection();
  }, [testConnection]);

  useEffect(() => {
    if (!sshPath) {
      setStatus('disconnected');
      setError(null);
      return;
    }

    testConnection();
  }, [sshPath, testConnection]);

  useEffect(() => {
    if (!autoReconnect || !sshPath) return;

    if (status === 'error' && retriesRef.current < maxRetries) {
      const timeoutId = setTimeout(() => {
        retriesRef.current += 1;
        testConnection();
      }, retryDelay * Math.pow(2, retriesRef.current));

      return () => clearTimeout(timeoutId);
    }
  }, [status, autoReconnect, maxRetries, retryDelay, sshPath, testConnection]);

  useEffect(() => {
    if (checkInterval <= 0 || !sshPath) return;

    intervalRef.current = setInterval(() => {
      if (!isChecking) {
        testConnection();
      }
    }, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkInterval, sshPath, isChecking, testConnection]);

  return {
    status,
    error,
    lastChecked,
    testConnection,
    reconnect,
    isChecking,
  };
}
