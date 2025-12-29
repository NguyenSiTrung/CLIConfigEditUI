import { CheckCircle, XCircle, Loader2, WifiOff } from 'lucide-react';
import type { SshConnectionStatus } from '@/types';

interface ConnectionStatusBadgeProps {
  status: SshConnectionStatus;
  error?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function ConnectionStatusBadge({
  status,
  error,
  size = 'sm',
  showLabel = false,
}: ConnectionStatusBadgeProps) {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  
  const getConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          label: 'Connected',
          bgColor: 'bg-emerald-100 dark:bg-emerald-500/15',
          textColor: 'text-emerald-600 dark:text-emerald-400',
          borderColor: 'border-emerald-500/30',
          dotColor: 'bg-emerald-500',
        };
      case 'error':
        return {
          icon: XCircle,
          label: 'Error',
          bgColor: 'bg-red-100 dark:bg-red-500/15',
          textColor: 'text-red-600 dark:text-red-400',
          borderColor: 'border-red-500/30',
          dotColor: 'bg-red-500',
        };
      case 'checking':
        return {
          icon: Loader2,
          label: 'Checking...',
          bgColor: 'bg-indigo-100 dark:bg-indigo-500/15',
          textColor: 'text-indigo-600 dark:text-indigo-400',
          borderColor: 'border-indigo-500/30',
          dotColor: 'bg-indigo-500',
          animate: true,
        };
      default:
        return {
          icon: WifiOff,
          label: 'Disconnected',
          bgColor: 'bg-slate-100 dark:bg-slate-500/15',
          textColor: 'text-slate-500 dark:text-slate-400',
          borderColor: 'border-slate-500/30',
          dotColor: 'bg-slate-400',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  if (!showLabel) {
    return (
      <div 
        className={`relative flex items-center justify-center`}
        title={error ? `${config.label}: ${error}` : config.label}
      >
        <Icon className={`${iconSize} ${config.textColor} ${config.animate ? 'animate-spin' : ''}`} />
      </div>
    );
  }

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded-full border
        ${config.bgColor} ${config.borderColor}
      `}
      title={error || undefined}
    >
      <Icon className={`${iconSize} ${config.textColor} ${config.animate ? 'animate-spin' : ''}`} />
      <span className={`text-xs font-medium ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  );
}
