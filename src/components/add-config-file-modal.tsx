import { useState, useEffect } from 'react';
import { ConfigFormat, CliTool, CustomTool, SuggestedConfig, PathSafetyResult, PathType, SshConnectionStatus } from '@/types';
import { FolderOpen, Sparkles, Check, AlertTriangle } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { Modal, Button, Input } from '@/components/ui';
import { PathTypeSelector, SshPathInput } from '@/components/ssh';

interface AddConfigFileModalProps {
  isOpen: boolean;
  tool: CliTool | CustomTool | null;
  onClose: () => void;
  onAdd: (configFile: { 
    label: string; 
    path: string; 
    format: ConfigFormat; 
    jsonPath?: string;
    pathType?: PathType;
    sshPath?: string;
  }) => void;
}

const FORMAT_OPTIONS: { value: ConfigFormat; label: string; color: string }[] = [
  { value: 'json', label: 'JSON', color: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30' },
  { value: 'yaml', label: 'YAML', color: 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30' },
  { value: 'toml', label: 'TOML', color: 'bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30' },
  { value: 'ini', label: 'INI', color: 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30' },
  { value: 'md', label: 'MD', color: 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30' },
];



interface SuggestionWithStatus extends SuggestedConfig {
  exists: boolean;
  resolvedPath: string;
}

export function AddConfigFileModal({ isOpen, tool, onClose, onAdd }: AddConfigFileModalProps) {
  const [label, setLabel] = useState('');
  const [path, setPath] = useState('');
  const [format, setFormat] = useState<ConfigFormat>('json');

  const [jsonPath, setJsonPath] = useState<string | undefined>(undefined);
  const [suggestions, setSuggestions] = useState<SuggestionWithStatus[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const [showPathWarning, setShowPathWarning] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<{ label: string; path: string; format: ConfigFormat; jsonPath?: string; pathType?: PathType; sshPath?: string } | null>(null);

  const [pathType, setPathType] = useState<PathType>('local');
  const [sshPath, setSshPath] = useState('');
  const [, setSshConnectionStatus] = useState<SshConnectionStatus>('disconnected');

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

  if (!tool) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pathType === 'ssh') {
      if (!label.trim() || !sshPath.trim()) return;
      
      const configData = {
        label: label.trim(),
        path: sshPath.trim(),
        format,
        jsonPath,
        pathType: 'ssh' as PathType,
        sshPath: sshPath.trim(),
      };
      
      onAdd(configData);
      resetForm();
      onClose();
      return;
    }
    
    if (!label.trim() || !path.trim()) return;

    const configData = {
      label: label.trim(),
      path: path.trim(),
      format,
      jsonPath,
      pathType: 'local' as PathType,
    };

    try {
      const safetyResult = await invoke<PathSafetyResult>('check_path_safety', { path: path.trim() });
      
      if (safetyResult.safetyLevel === 'warn') {
        setPendingSubmit(configData);
        setShowPathWarning(true);
        return;
      }
      
      if (safetyResult.safetyLevel === 'block') {
        setPendingSubmit(configData);
        setShowPathWarning(true);
        return;
      }
    } catch (err) {
      console.error('Failed to check path safety:', err);
    }

    onAdd(configData);
    resetForm();
    onClose();
  };

  const handleConfirmPathWarning = () => {
    if (pendingSubmit) {
      onAdd(pendingSubmit);
      resetForm();
      setShowPathWarning(false);
      setPendingSubmit(null);
      onClose();
    }
  };

  const handleCancelPathWarning = () => {
    setShowPathWarning(false);
    setPendingSubmit(null);
  };

  const handleSelectSuggestion = (suggestion: SuggestionWithStatus) => {
    setLabel(suggestion.label);
    setPath(suggestion.path);
    setFormat(suggestion.format);
    setJsonPath(suggestion.jsonPath);
    setShowSuggestions(false);
  };

  const resetForm = () => {
    setLabel('');
    setPath('');
    setFormat('json');
    setJsonPath(undefined);
    setShowSuggestions(true);
    setShowPathWarning(false);
    setPendingSubmit(null);
    setPathType('local');
    setSshPath('');
    setSshConnectionStatus('disconnected');
  };

  const handleBrowseFile = async () => {
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

  const footerContent = (
    <>
      <Button variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" form="add-config-form">
        Add Config File
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Config File"
      description={`for ${tool.name}`}
      size="lg"
      footer={footerContent}
    >
      {/* Suggestions Section */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium dark:text-slate-300 text-slate-700">
              Suggested Configs
            </span>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-white/5 
                           bg-white dark:bg-white/5 hover:border-indigo-500/50 
                           hover:bg-indigo-50 dark:hover:bg-indigo-500/10
                           transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{suggestion.icon || '📄'}</span>
                    <div>
                      <div className="font-medium dark:text-slate-200 text-slate-800 text-sm">
                        {suggestion.label}
                      </div>
                      <div className="text-xs dark:text-slate-500 text-slate-400 font-mono mt-0.5">
                        {suggestion.path}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {suggestion.exists && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3 h-3" />
                        Exists
                      </span>
                    )}
                    <span className={`text-[11px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider ${FORMAT_OPTIONS.find(f => f.value === suggestion.format)?.color || 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}>
                      {suggestion.format}
                    </span>
                  </div>
                </div>
                {suggestion.description && (
                  <p className="text-xs dark:text-slate-400 text-slate-500 mt-2 pl-9 opacity-80">
                    {suggestion.description}
                  </p>
                )}
              </button>
            ))}
          </div>
          <div className="text-center mt-4">
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Or add custom config file →
            </button>
          </div>
        </div>
      )}

      <form id="add-config-form" onSubmit={handleSubmit} className="space-y-5">
        {!showSuggestions && suggestions.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSuggestions(true)}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-2 flex items-center gap-1"
          >
            ← Back to suggestions
          </button>
        )}

        <Input
          label="Label *"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Settings, MCP, Memory..."
          required
          autoFocus={!showSuggestions || suggestions.length === 0}
        />

        {/* Path Type Selector */}
        <PathTypeSelector
          value={pathType}
          onChange={(value) => {
            setPathType(value);
            if (value === 'ssh') {
              setShowSuggestions(false);
            }
          }}
        />

        {/* Local Path Input */}
        {pathType === 'local' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              File Path *
            </label>
            <div className="relative">
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="~/.config/tool/config.json"
                className="w-full px-3 py-2 pr-12 rounded-lg text-sm font-mono
                           bg-white dark:bg-slate-900/50
                           border border-slate-300 dark:border-slate-700
                           text-slate-900 dark:text-white
                           placeholder:text-slate-400 dark:placeholder:text-slate-500
                           transition-colors duration-200
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:ring-offset-0"
                required={pathType === 'local'}
              />
              <button
                type="button"
                onClick={handleBrowseFile}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md 
                           text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                title="Browse files"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Use ~ for home directory. File will be created if it doesn't exist.
            </p>
          </div>
        )}

        {/* SSH Path Input */}
        {pathType === 'ssh' && (
          <SshPathInput
            value={sshPath}
            onChange={setSshPath}
            onConnectionStatusChange={(status) => setSshConnectionStatus(status)}
          />
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Format *
          </label>
          <div className="grid grid-cols-5 gap-2">
            {FORMAT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormat(option.value)}
                className={`px-2 py-2.5 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center justify-center gap-1
                           ${format === option.value
                    ? `${option.color} border shadow-sm ring-1 ring-current/20 scale-105`
                    : 'bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* Path Safety Warning Modal */}
      <Modal
        isOpen={showPathWarning}
        onClose={handleCancelPathWarning}
        title="Unusual File Location"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={handleCancelPathWarning}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmPathWarning}>
              Add Anyway
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 rounded-lg bg-amber-100 dark:bg-amber-500/15">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              This file path is in an unusual location that isn't a standard config directory.
            </p>
            <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-600 dark:text-slate-400 break-all">
              {pendingSubmit?.path}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to add this config file?
            </p>
          </div>
        </div>
      </Modal>
    </Modal>
  );
}
