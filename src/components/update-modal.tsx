import { Modal } from './ui';
import { Download, RefreshCw, Sparkles } from 'lucide-react';
import type { UpdateInfo } from '@/hooks/use-update-checker';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
  onDownloadAndInstall: () => Promise<void>;
  isInstalling: boolean;
  installProgress: number;
  onDismiss: () => void;
}

export function UpdateModal({
  isOpen,
  onClose,
  updateInfo,
  onDownloadAndInstall,
  isInstalling,
  installProgress,
  onDismiss,
}: UpdateModalProps) {
  const handleInstall = async () => {
    await onDownloadAndInstall();
  };

  const handleDismiss = () => {
    onDismiss();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Available"
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/30">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Version {updateInfo?.version} is available
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              A new version of CLI Config Editor is ready to install.
            </p>
          </div>
        </div>

        {updateInfo?.body && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              What's New
            </h4>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 max-h-40 overflow-y-auto">
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {updateInfo.body}
              </p>
            </div>
          </div>
        )}

        {isInstalling && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">
                Downloading update...
              </span>
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                {installProgress}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${installProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The app will restart after installation completes.
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                       bg-indigo-600 hover:bg-indigo-700 
                       text-white font-medium text-sm
                       transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          >
            {isInstalling ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Installing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download & Install
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            disabled={isInstalling}
            className="px-4 py-2.5 rounded-lg
                       bg-slate-100 hover:bg-slate-200 
                       dark:bg-slate-700 dark:hover:bg-slate-600
                       text-slate-700 dark:text-slate-300
                       font-medium text-sm
                       transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            title="Remind me later"
          >
            Later
          </button>
        </div>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          You can always update later from Settings → About
        </p>
      </div>
    </Modal>
  );
}

interface UpdateBadgeProps {
  onClick: () => void;
  version: string;
}

export function UpdateBadge({ onClick, version }: UpdateBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-1.5 px-2 py-0.5 rounded-full
                 bg-gradient-to-r from-amber-500/10 to-orange-500/10
                 dark:from-amber-500/20 dark:to-orange-500/20
                 border border-amber-200 dark:border-amber-700/50
                 text-amber-700 dark:text-amber-400
                 hover:bg-amber-500/20 dark:hover:bg-amber-500/30
                 transition-colors duration-200
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
      title={`Update to v${version} available`}
      aria-label={`Update available: version ${version}. Click to install.`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
      </span>
      <span className="text-xs font-medium">Update</span>
    </button>
  );
}
