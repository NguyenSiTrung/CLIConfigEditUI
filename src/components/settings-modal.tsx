import { X, Moon, Sun } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, toggleTheme } = useAppStore();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 dark:bg-black/60 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="dark:bg-gray-800 bg-white rounded-xl shadow-2xl w-full max-w-md border dark:border-gray-700/50 border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700/50 border-slate-200">
          <h2 className="text-lg font-semibold dark:text-white text-slate-800">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg dark:text-gray-400 text-slate-400 dark:hover:text-white hover:text-slate-700 dark:hover:bg-gray-700/50 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-3">
              Appearance
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { if (theme === 'light') toggleTheme(); }}
                className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2
                           border transition-all
                           ${theme === 'dark'
                             ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                             : 'dark:bg-gray-900/50 bg-slate-50 dark:border-gray-700/50 border-slate-200 dark:text-gray-400 text-slate-500 dark:hover:text-white hover:text-slate-700 dark:hover:border-gray-600 hover:border-slate-300 hover:bg-slate-100'
                           }`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
              <button
                onClick={() => { if (theme === 'dark') toggleTheme(); }}
                className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2
                           border transition-all
                           ${theme === 'light'
                             ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                             : 'dark:bg-gray-900/50 bg-slate-50 dark:border-gray-700/50 border-slate-200 dark:text-gray-400 text-slate-500 dark:hover:text-white hover:text-slate-700 dark:hover:border-gray-600 hover:border-slate-300 hover:bg-slate-100'
                           }`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
            </div>
          </div>

          <div className="pt-4 border-t dark:border-gray-700/50 border-slate-200">
            <p className="text-xs dark:text-gray-500 text-slate-400 text-center">
              CLI Config Editor v1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
