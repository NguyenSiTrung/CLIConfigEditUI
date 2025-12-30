import { CliTool } from '@/types';
import { X } from 'lucide-react';

interface ConfigureToolModalProps {
  isOpen: boolean;
  tool: CliTool | null;
  currentPath?: string | null;
  onClose: () => void;
  onSave: (toolId: string, configPath: string) => void;
}

// This modal is deprecated in favor of AddConfigFileModal
// Kept for backward compatibility
export function ConfigureToolModal({ isOpen, tool, onClose }: ConfigureToolModalProps) {
  if (!isOpen || !tool) return null;

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
      <div className="dark:bg-slate-800 bg-white rounded-xl shadow-2xl w-full max-w-md border dark:border-slate-700/50 border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-slate-700/50 border-slate-200">
          <h2 className="text-lg font-semibold dark:text-white text-slate-800">Configure {tool.name}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg dark:text-slate-400 text-slate-400 dark:hover:text-white hover:text-slate-700 dark:hover:bg-slate-700/50 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="dark:text-slate-400 text-slate-600 text-sm">
            This feature has been updated. Please use the "Add config file" button in the sidebar to add configuration files for {tool.name}.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 
                         text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
