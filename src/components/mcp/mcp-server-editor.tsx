import { useState } from 'react';
import { McpServer } from '@/types';
import { X, Plus, Trash2 } from 'lucide-react';

interface McpServerEditorProps {
  server?: McpServer;
  onSave: (server: McpServer) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export function McpServerEditor({ server, onSave, onCancel, isEdit = false }: McpServerEditorProps) {
  const [name, setName] = useState(server?.name || '');
  const [command, setCommand] = useState(server?.command || '');
  const [args, setArgs] = useState<string[]>(server?.args || []);
  const [envPairs, setEnvPairs] = useState<{ key: string; value: string }[]>(
    server?.env ? Object.entries(server.env).map(([key, value]) => ({ key, value })) : []
  );
  const [disabled, setDisabled] = useState(server?.disabled || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !command.trim()) return;

    const env: Record<string, string> = {};
    envPairs.forEach(({ key, value }) => {
      if (key.trim()) {
        env[key.trim()] = value;
      }
    });

    onSave({
      name: name.trim(),
      command: command.trim(),
      args: args.filter((a) => a.trim()),
      env: Object.keys(env).length > 0 ? env : undefined,
      disabled: disabled || undefined,
    });
  };

  const addArg = () => setArgs([...args, '']);
  const removeArg = (index: number) => setArgs(args.filter((_, i) => i !== index));
  const updateArg = (index: number, value: string) => {
    const newArgs = [...args];
    newArgs[index] = value;
    setArgs(newArgs);
  };

  const addEnvPair = () => setEnvPairs([...envPairs, { key: '', value: '' }]);
  const removeEnvPair = (index: number) => setEnvPairs(envPairs.filter((_, i) => i !== index));
  const updateEnvPair = (index: number, field: 'key' | 'value', value: string) => {
    const newPairs = [...envPairs];
    newPairs[index][field] = value;
    setEnvPairs(newPairs);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium dark:text-slate-300 text-slate-700 mb-1">
          Server Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="filesystem, git, etc."
          className="w-full px-3 py-2 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-slate-100 rounded-lg text-sm
                     placeholder-slate-400 dark:placeholder-slate-600 border border-slate-200 dark:border-white/10
                     focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
          required
          disabled={isEdit}
        />
      </div>

      <div>
        <label className="block text-sm font-medium dark:text-slate-300 text-slate-700 mb-1">
          Command <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="npx, uvx, node, etc."
          className="w-full px-3 py-2 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-slate-100 rounded-lg text-sm
                     placeholder-slate-400 dark:placeholder-slate-600 border border-slate-200 dark:border-white/10
                     focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-mono"
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium dark:text-slate-300 text-slate-700">
            Arguments
          </label>
          <button
            type="button"
            onClick={addArg}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {args.map((arg, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={arg}
                onChange={(e) => updateArg(index, e.target.value)}
                placeholder={`Argument ${index + 1}`}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-slate-100 rounded-lg text-sm
                           placeholder-slate-400 dark:placeholder-slate-600 border border-slate-200 dark:border-white/10
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={() => removeArg(index)}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium dark:text-slate-300 text-slate-700">
            Environment Variables
          </label>
          <button
            type="button"
            onClick={addEnvPair}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {envPairs.map((pair, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={pair.key}
                onChange={(e) => updateEnvPair(index, 'key', e.target.value)}
                placeholder="KEY"
                className="w-1/3 px-3 py-2 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-slate-100 rounded-lg text-sm
                           placeholder-slate-400 dark:placeholder-slate-600 border border-slate-200 dark:border-white/10
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-mono"
              />
              <input
                type="text"
                value={pair.value}
                onChange={(e) => updateEnvPair(index, 'value', e.target.value)}
                placeholder="value"
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-slate-100 rounded-lg text-sm
                           placeholder-slate-400 dark:placeholder-slate-600 border border-slate-200 dark:border-white/10
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={() => removeEnvPair(index)}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="disabled"
          checked={disabled}
          onChange={(e) => setDisabled(e.target.checked)}
          className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="disabled" className="text-sm dark:text-slate-300 text-slate-700">
          Disabled
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200
                     rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 
                     text-white rounded-lg transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
        >
          {isEdit ? 'Save Changes' : 'Add Server'}
        </button>
      </div>
    </form>
  );
}

interface McpServerEditorModalProps {
  isOpen: boolean;
  server?: McpServer;
  onSave: (server: McpServer) => void;
  onClose: () => void;
}

export function McpServerEditorModal({ isOpen, server, onSave, onClose }: McpServerEditorModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="glass-panel rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-white/5">
          <h2 className="text-lg font-semibold dark:text-slate-200 text-slate-800">
            {server ? 'Edit MCP Server' : 'Add MCP Server'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <McpServerEditor
            server={server}
            onSave={(s) => {
              onSave(s);
              onClose();
            }}
            onCancel={onClose}
            isEdit={!!server}
          />
        </div>
      </div>
    </div>
  );
}
