import { useState, useEffect } from 'react';
import { ConfigFormat, ConfigFile } from '@/types';
import { X, FolderOpen, FileJson, FileCode, FileText } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';

interface EditConfigFileModalProps {
  isOpen: boolean;
  configFile: ConfigFile | null;
  toolName: string;
  onClose: () => void;
  onSave: (updates: Partial<ConfigFile>) => void;
}

const FORMAT_OPTIONS: { value: ConfigFormat; label: string; icon: React.ReactNode }[] = [
  { value: 'json', label: 'JSON', icon: <FileJson className="w-4 h-4" /> },
  { value: 'yaml', label: 'YAML', icon: <FileCode className="w-4 h-4" /> },
  { value: 'toml', label: 'TOML', icon: <FileText className="w-4 h-4" /> },
  { value: 'ini', label: 'INI', icon: <FileText className="w-4 h-4" /> },
  { value: 'md', label: 'Markdown', icon: <FileText className="w-4 h-4" /> },
];

const ICON_OPTIONS = ['⚙️', '🔌', '📝', '🔧', '📋', '🗂️', '💾', '🎯'];

export function EditConfigFileModal({ isOpen, configFile, toolName, onClose, onSave }: EditConfigFileModalProps) {
  const [label, setLabel] = useState('');
  const [path, setPath] = useState('');
  const [format, setFormat] = useState<ConfigFormat>('json');
  const [icon, setIcon] = useState('⚙️');

  useEffect(() => {
    if (configFile) {
      setLabel(configFile.label);
      setPath(configFile.path);
      setFormat(configFile.format);
      setIcon(configFile.icon || '⚙️');
    }
  }, [configFile]);

  if (!isOpen || !configFile) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !path.trim()) return;

    onSave({
      label: label.trim(),
      path: path.trim(),
      format,
      icon,
    });

    onClose();
  };

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
          <div>
            <h2 className="text-lg font-semibold dark:text-white text-slate-800">Edit Config File</h2>
            <p className="text-sm dark:text-gray-400 text-slate-500 mt-0.5">
              {toolName}
            </p>
          </div>
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
              Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Settings, MCP, Memory..."
              className="w-full px-4 py-2.5 dark:bg-gray-900/50 bg-slate-50 dark:text-white text-slate-800 rounded-lg text-sm
                         dark:placeholder-gray-500 placeholder-slate-400 border dark:border-gray-700/50 border-slate-200
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                         transition-all"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
              File Path <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="~/.config/tool/config.json"
                className="w-full px-4 py-2.5 pr-12 dark:bg-gray-900/50 bg-slate-50 dark:text-white text-slate-800 rounded-lg text-sm
                           dark:placeholder-gray-500 placeholder-slate-400 border dark:border-gray-700/50 border-slate-200 font-mono
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                           transition-all"
                required
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
                    setPath(selected);
                    const ext = selected.split('.').pop()?.toLowerCase();
                    if (ext === 'json') setFormat('json');
                    else if (ext === 'yml' || ext === 'yaml') setFormat('yaml');
                    else if (ext === 'toml') setFormat('toml');
                    else if (ext === 'ini') setFormat('ini');
                    else if (ext === 'md') setFormat('md');
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md 
                           dark:text-gray-400 text-slate-400 dark:hover:text-white hover:text-slate-700 dark:hover:bg-gray-700/50 hover:bg-slate-200 transition-colors"
                title="Browse files"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
              Format <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {FORMAT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormat(option.value)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1
                             border transition-all
                             ${format === option.value
                               ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                               : 'dark:bg-gray-900/50 bg-slate-50 dark:border-gray-700/50 border-slate-200 dark:text-gray-400 text-slate-500 dark:hover:text-white hover:text-slate-700 dark:hover:border-gray-600 hover:border-slate-300'
                             }`}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
              Icon
            </label>
            <div className="flex gap-2 flex-wrap">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setIcon(opt)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-all
                             ${icon === opt
                               ? 'bg-blue-600 border-blue-500 shadow-md'
                               : 'dark:bg-gray-900/50 bg-slate-50 dark:border-gray-700/50 border-slate-200 dark:hover:border-gray-600 hover:border-slate-300'
                             }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
