import { useState, useEffect } from 'react';
import { ConfigFormat, ConfigFile } from '@/types';
import { FolderOpen, FileJson, FileCode, FileText } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { Modal, Button, Input } from '@/components/ui';

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

  if (!configFile) return null;

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

  const handleBrowse = async () => {
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
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" form="edit-config-form">
        Save Changes
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Config File"
      description={toolName}
      footer={footer}
    >
      <form id="edit-config-form" onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Settings, MCP, Memory..."
          required
          autoFocus
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            File Path
          </label>
          <div className="relative">
            <Input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="~/.config/tool/config.json"
              className="font-mono pr-12"
              required
            />
            <button
              type="button"
              onClick={handleBrowse}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md 
                         text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white 
                         hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors"
              title="Browse files"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                             ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                             : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600'
                           }`}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                             ? 'bg-indigo-600 border-indigo-500 shadow-md'
                             : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'
                           }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
