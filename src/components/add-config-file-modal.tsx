import { useState, useEffect } from 'react';
import { ConfigFormat, CliTool, CustomTool, SuggestedConfig } from '@/types';
import { X, FolderOpen, Sparkles, Check } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

interface AddConfigFileModalProps {
  isOpen: boolean;
  tool: CliTool | CustomTool | null;
  onClose: () => void;
  onAdd: (configFile: { label: string; path: string; format: ConfigFormat; icon?: string; jsonPath?: string }) => void;
}

const FORMAT_OPTIONS: { value: ConfigFormat; label: string; color: string }[] = [
  { value: 'json', label: 'JSON', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  { value: 'yaml', label: 'YAML', color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  { value: 'toml', label: 'TOML', color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
  { value: 'ini', label: 'INI', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' },
  { value: 'md', label: 'MD', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
];

const ICON_OPTIONS = ['⚙️', '🔌', '📝', '🔧', '📋', '🗂️', '💾', '🎯'];

interface SuggestionWithStatus extends SuggestedConfig {
  exists: boolean;
  resolvedPath: string;
}

export function AddConfigFileModal({ isOpen, tool, onClose, onAdd }: AddConfigFileModalProps) {
  const [label, setLabel] = useState('');
  const [path, setPath] = useState('');
  const [format, setFormat] = useState<ConfigFormat>('json');
  const [icon, setIcon] = useState('⚙️');
  const [jsonPath, setJsonPath] = useState<string | undefined>(undefined);
  const [suggestions, setSuggestions] = useState<SuggestionWithStatus[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    if (isOpen && tool && 'suggestedConfigs' in tool && tool.suggestedConfigs) {
      checkSuggestions(tool.suggestedConfigs);
    } else {
      setSuggestions([]);
    }
  }, [isOpen, tool]);

  const checkSuggestions = async (configs: SuggestedConfig[]) => {
    try {
      const paths = configs.map(c => c.path);
      const results = await invoke<{ path: string; exists: boolean; resolvedPath: string }[]>(
        'check_multiple_paths',
        { paths }
      );
      
      const withStatus: SuggestionWithStatus[] = configs.map((config, index) => ({
        ...config,
        exists: results[index]?.exists || false,
        resolvedPath: results[index]?.resolvedPath || config.path,
      }));
      
      setSuggestions(withStatus);
    } catch (err) {
      console.error('Failed to check suggestion paths:', err);
      setSuggestions(configs.map(c => ({ ...c, exists: false, resolvedPath: c.path })));
    }
  };

  if (!isOpen || !tool) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !path.trim()) return;

    onAdd({
      label: label.trim(),
      path: path.trim(),
      format,
      icon,
      jsonPath,
    });

    resetForm();
    onClose();
  };

  const handleSelectSuggestion = (suggestion: SuggestionWithStatus) => {
    setLabel(suggestion.label);
    setPath(suggestion.path);
    setFormat(suggestion.format);
    if (suggestion.icon) setIcon(suggestion.icon);
    setJsonPath(suggestion.jsonPath);
    setShowSuggestions(false);
  };

  const resetForm = () => {
    setLabel('');
    setPath('');
    setFormat('json');
    setIcon('⚙️');
    setJsonPath(undefined);
    setShowSuggestions(true);
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
      <div className="dark:bg-gray-800 bg-white rounded-xl shadow-2xl w-full max-w-lg border dark:border-gray-700/50 border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700/50 border-slate-200 sticky top-0 dark:bg-gray-800 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold dark:text-white text-slate-800">Add Config File</h2>
            <p className="text-sm dark:text-gray-400 text-slate-500 mt-0.5">
              for {tool.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg dark:text-gray-400 text-slate-400 dark:hover:text-white hover:text-slate-700 dark:hover:bg-gray-700/50 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggestions Section */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="px-6 py-4 border-b dark:border-gray-700/50 border-slate-200 dark:bg-gray-900/30 bg-slate-50">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium dark:text-gray-300 text-slate-700">
                Suggested Configs
              </span>
            </div>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full p-3 rounded-lg border dark:border-gray-700/50 border-slate-200 
                             dark:bg-gray-800/50 bg-white hover:border-blue-500/50 
                             dark:hover:bg-gray-700/50 hover:bg-slate-50
                             transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{suggestion.icon || '📄'}</span>
                      <div>
                        <div className="font-medium dark:text-white text-slate-800 text-sm">
                          {suggestion.label}
                        </div>
                        <div className="text-xs dark:text-gray-500 text-slate-400 font-mono mt-0.5">
                          {suggestion.path}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {suggestion.exists && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <Check className="w-3 h-3" />
                          Exists
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-md uppercase font-medium ${
                        FORMAT_OPTIONS.find(f => f.value === suggestion.format)?.color || 'bg-slate-200 dark:bg-gray-700 text-slate-500 dark:text-gray-400'
                      }`}>
                        {suggestion.format}
                      </span>
                    </div>
                  </div>
                  {suggestion.description && (
                    <p className="text-xs dark:text-gray-500 text-slate-400 mt-1.5">
                      {suggestion.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
            <div className="text-center mt-3">
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-xs dark:text-gray-500 text-slate-400 hover:text-blue-500 transition-colors"
              >
                Or add custom config file →
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!showSuggestions && suggestions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSuggestions(true)}
              className="text-sm dark:text-blue-400 text-blue-600 hover:underline mb-2"
            >
              ← Back to suggestions
            </button>
          )}

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
              autoFocus={!showSuggestions || suggestions.length === 0}
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
            <p className="mt-1.5 text-xs dark:text-gray-500 text-slate-400">
              Use ~ for home directory. File will be created if it doesn't exist.
            </p>
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
                  className={`px-2 py-2.5 rounded-lg text-xs font-semibold border transition-all
                             ${format === option.value
                               ? `${option.color} border shadow-sm ring-1 ring-current/20`
                               : 'dark:bg-gray-900/50 bg-slate-50 dark:border-gray-700/50 border-slate-200 dark:text-gray-400 text-slate-500 dark:hover:text-white hover:text-slate-700 dark:hover:border-gray-600 hover:border-slate-300'
                             }`}
                >
                  {option.label}
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
              Add Config File
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
