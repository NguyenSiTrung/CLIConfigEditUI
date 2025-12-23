import { useState } from 'react';
import { ConfigFormat } from '@/types';
import { FolderOpen, FileJson, FileCode, FileText } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { IconPicker } from './icon-picker';
import { Modal, Button, Input } from '@/components/ui';

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

export function AddToolModal({ isOpen, onClose, onAdd }: AddToolModalProps) {
  const [name, setName] = useState('');
  const [configPath, setConfigPath] = useState('');
  const [configFormat, setConfigFormat] = useState<ConfigFormat>('json');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🔧');

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

  const handleBrowse = async () => {
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
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" form="add-tool-form">
        Add Tool
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Custom Tool"
      size="md"
      footer={footer}
    >
      <form id="add-tool-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-4 items-start">
          <div>
            <label className="block text-sm font-medium dark:text-slate-300 text-slate-700 mb-2">
              Icon
            </label>
            <IconPicker value={icon} onChange={setIcon} />
          </div>

          <div className="flex-1">
            <Input
              label="Tool Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Custom CLI"
              required
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-slate-300 text-slate-700 mb-2">
            Config File Path <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={configPath}
              onChange={(e) => setConfigPath(e.target.value)}
              placeholder="~/.mycli/config.json"
              className="w-full px-4 py-2.5 pr-12 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-slate-100 rounded-lg text-sm
                         placeholder-slate-400 dark:placeholder-slate-600 border border-slate-200 dark:border-white/10 font-mono
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                         transition-all"
              required
            />
            <button
              type="button"
              onClick={handleBrowse}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md 
                         text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              title="Browse files"
              aria-label="Browse files"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Use ~ for home directory, or provide absolute path
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-slate-300 text-slate-700 mb-2">
            Config Format <span className="text-rose-500">*</span>
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
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100'
                  }`}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </form>
    </Modal>
  );
}
