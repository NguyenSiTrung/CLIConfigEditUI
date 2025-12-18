import { useState } from 'react';
import { ConfigFormat } from '@/types';
import { X, FolderOpen, FileJson, FileCode, FileText } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tool: { name: string; configPath: string; configFormat: ConfigFormat; description?: string; icon?: string }) => void;
}

const FORMAT_OPTIONS: { value: ConfigFormat; label: string; icon: React.ReactNode }[] = [
  { value: 'json', label: 'JSON', icon: <FileJson className="w-4 h-4" /> },
  { value: 'yaml', label: 'YAML', icon: <FileCode className="w-4 h-4" /> },
  { value: 'toml', label: 'TOML', icon: <FileText className="w-4 h-4" /> },
  { value: 'ini', label: 'INI', icon: <FileText className="w-4 h-4" /> },
];

const ICON_OPTIONS = ['🔧', '⚙️', '🛠️', '📦', '🚀', '💻', '🔌', '📝', '🎯', '🗂️', '💾', '🔒'];

export function AddToolModal({ isOpen, onClose, onAdd }: AddToolModalProps) {
  const [name, setName] = useState('');
  const [configPath, setConfigPath] = useState('');
  const [configFormat, setConfigFormat] = useState<ConfigFormat>('json');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🔧');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !configPath.trim()) return;

    onAdd({
      name: name.trim(),
      configPath: configPath.trim(),
      configFormat,
      description: description.trim() || undefined,
      icon,
    });

    setName('');
    setConfigPath('');
    setConfigFormat('json');
    setDescription('');
    setIcon('🔧');
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
          <h2 className="text-lg font-semibold dark:text-white text-slate-800">Add Custom Tool</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg dark:text-gray-400 text-slate-400 dark:hover:text-white hover:text-slate-700 dark:hover:bg-gray-700/50 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
                Icon
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    const menu = e.currentTarget.nextElementSibling;
                    menu?.classList.toggle('hidden');
                  }}
                  className="w-12 h-12 flex items-center justify-center text-2xl rounded-lg border 
                             dark:bg-gray-900/50 bg-slate-50 dark:border-gray-700/50 border-slate-200
                             hover:border-blue-500 transition-colors"
                >
                  {icon}
                </button>
                <div className="hidden absolute left-0 top-full mt-1 z-20 dark:bg-gray-800 bg-white rounded-lg shadow-lg border dark:border-gray-700 border-slate-200 p-2 grid grid-cols-6 gap-1">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={(e) => {
                        setIcon(opt);
                        e.currentTarget.parentElement?.classList.add('hidden');
                      }}
                      className={`w-8 h-8 flex items-center justify-center text-lg rounded-md transition-colors
                                 ${icon === opt 
                                   ? 'bg-blue-600 text-white' 
                                   : 'dark:hover:bg-gray-700 hover:bg-slate-100'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
                Tool Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Custom CLI"
                className="w-full px-4 py-2.5 dark:bg-gray-900/50 bg-slate-50 dark:text-white text-slate-800 rounded-lg text-sm
                           dark:placeholder-gray-500 placeholder-slate-400 border dark:border-gray-700/50 border-slate-200
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                           transition-all"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
              Config File Path <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={configPath}
                onChange={(e) => setConfigPath(e.target.value)}
                placeholder="~/.mycli/config.json"
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
                    setConfigPath(selected);
                    const ext = selected.split('.').pop()?.toLowerCase();
                    if (ext === 'json') setConfigFormat('json');
                    else if (ext === 'yml' || ext === 'yaml') setConfigFormat('yaml');
                    else if (ext === 'toml') setConfigFormat('toml');
                    else if (ext === 'ini') setConfigFormat('ini');
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

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
              Config Format <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {FORMAT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setConfigFormat(option.value)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium flex flex-col items-center gap-1.5
                             border transition-all
                             ${configFormat === option.value
                               ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                               : 'dark:bg-gray-900/50 bg-slate-50 dark:border-gray-700/50 border-slate-200 dark:text-gray-400 text-slate-500 dark:hover:text-white hover:text-slate-700 dark:hover:border-gray-600 hover:border-slate-300 hover:bg-slate-100'
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
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full px-4 py-2.5 dark:bg-gray-900/50 bg-slate-50 dark:text-white text-slate-800 rounded-lg text-sm
                         dark:placeholder-gray-500 placeholder-slate-400 border dark:border-gray-700/50 border-slate-200
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                         transition-all"
            />
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
              Add Tool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
