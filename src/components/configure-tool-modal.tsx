import { useState, useEffect } from 'react';
import { CliTool } from '@/types';
import { X, FolderOpen } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';

interface ConfigureToolModalProps {
  isOpen: boolean;
  tool: CliTool | null;
  currentPath?: string | null;
  onClose: () => void;
  onSave: (toolId: string, configPath: string) => void;
}

export function ConfigureToolModal({ isOpen, tool, currentPath, onClose, onSave }: ConfigureToolModalProps) {
  const [configPath, setConfigPath] = useState('');

  useEffect(() => {
    if (tool) {
      if (currentPath) {
        setConfigPath(currentPath);
      } else {
        const platform = getPlatform();
        const defaultPaths = tool.configPaths[platform];
        setConfigPath(defaultPaths[0] || '');
      }
    }
  }, [tool, currentPath]);

  if (!isOpen || !tool) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configPath.trim()) return;

    onSave(tool.id, configPath.trim());
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const platform = getPlatform();
  const defaultPaths = tool.configPaths[platform];

  return (
    <div
      className="fixed inset-0 dark:bg-black/60 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="dark:bg-gray-800 bg-white rounded-xl shadow-2xl w-full max-w-md border dark:border-gray-700/50 border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700/50 border-slate-200">
          <h2 className="text-lg font-semibold dark:text-white text-slate-800">Configure {tool.name}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg dark:text-gray-400 text-slate-400 dark:hover:text-white hover:text-slate-700 dark:hover:bg-gray-700/50 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
              Config File Path <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={configPath}
                onChange={(e) => setConfigPath(e.target.value)}
                placeholder={defaultPaths[0] || '~/.config/tool/config.json'}
                className="w-full px-4 py-2.5 pr-12 dark:bg-gray-900/50 bg-slate-50 dark:text-white text-slate-800 rounded-lg text-sm
                           dark:placeholder-gray-500 placeholder-slate-400 border dark:border-gray-700/50 border-slate-200 font-mono
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                           transition-all"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={async () => {
                  const selected = await open({
                    multiple: false,
                    directory: false,
                    title: 'Select Config File',
                  });
                  if (selected) {
                    setConfigPath(selected);
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md 
                           dark:text-gray-400 text-slate-400 dark:hover:text-white hover:text-slate-700 dark:hover:bg-gray-700/50 hover:bg-slate-200 transition-colors"
                title="Browse files"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-1.5 text-xs dark:text-gray-500 text-slate-400">
              Use ~ for home directory, or provide absolute path
            </p>
          </div>

          {defaultPaths.length > 0 && (
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
                Default Locations Suggestion
              </label>
              <div className="space-y-1">
                {defaultPaths.map((path, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setConfigPath(path)}
                    className="w-full px-3 py-2 text-left text-xs font-mono dark:bg-gray-900/50 bg-slate-50 
                               dark:text-gray-400 text-slate-500 rounded-lg border dark:border-gray-700/50 border-slate-200
                               dark:hover:border-blue-500/50 hover:border-blue-400 dark:hover:text-blue-400 hover:text-blue-600
                               transition-colors truncate"
                  >
                    {path}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium dark:text-gray-400 text-slate-500 dark:hover:text-white hover:text-slate-800 
                         rounded-lg dark:hover:bg-gray-700/50 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 
                         text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20"
            >
              {currentPath ? 'Save Changes' : 'Create Config'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getPlatform(): 'macos' | 'linux' | 'windows' {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('mac')) return 'macos';
  return 'linux';
}
