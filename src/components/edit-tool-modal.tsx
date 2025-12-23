import { useState, useEffect } from 'react';
import { ConfigFormat, CustomTool } from '@/types';
import { FolderOpen, FileJson, FileCode, FileText } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { IconPicker } from './icon-picker';
import { Modal, Button, Input } from '@/components/ui';

interface EditToolModalProps {
  isOpen: boolean;
  tool: CustomTool | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<CustomTool>) => void;
}

const FORMAT_OPTIONS: { value: ConfigFormat; label: string; icon: React.ReactNode }[] = [
  { value: 'json', label: 'JSON', icon: <FileJson className="w-4 h-4" /> },
  { value: 'yaml', label: 'YAML', icon: <FileCode className="w-4 h-4" /> },
  { value: 'toml', label: 'TOML', icon: <FileText className="w-4 h-4" /> },
  { value: 'ini', label: 'INI', icon: <FileText className="w-4 h-4" /> },
];

export function EditToolModal({ isOpen, tool, onClose, onSave }: EditToolModalProps) {
  const [name, setName] = useState('');
  const [configPath, setConfigPath] = useState('');
  const [configFormat, setConfigFormat] = useState<ConfigFormat>('json');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🔧');

  useEffect(() => {
    if (tool) {
      setName(tool.name);
      setConfigPath(tool.configPath);
      setConfigFormat(tool.configFormat);
      setDescription(tool.description || '');
      setIcon(tool.icon || '🔧');
    }
  }, [tool]);

  if (!tool) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !configPath.trim()) return;

    onSave(tool.id, {
      name: name.trim(),
      configPath: configPath.trim(),
      configFormat,
      description: description.trim() || undefined,
      icon,
    });

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
      <Button type="submit" form="edit-tool-form">
        Save Changes
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Custom Tool"
      footer={footer}
    >
      <form id="edit-tool-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-4 items-start">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
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
              onClick={handleBrowse}
              aria-label="Browse files"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md 
                         dark:text-gray-400 text-slate-400 dark:hover:text-white hover:text-slate-700 dark:hover:bg-gray-700/50 hover:bg-slate-200 transition-colors"
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
                aria-label={`Select ${option.label} format`}
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
