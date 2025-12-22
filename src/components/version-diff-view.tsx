import { useState, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { useAppStore } from '@/stores/app-store';
import { VersionMetadata, ConfigVersion } from '@/types';
import { invoke } from '@tauri-apps/api/core';
import { X, ArrowLeft, Loader2 } from 'lucide-react';

interface VersionDiffViewProps {
  leftVersion: VersionMetadata;
  rightVersion: VersionMetadata | 'current';
  currentContent: string;
  configId: string;
  onClose: () => void;
}

export function VersionDiffView({ 
  leftVersion, 
  rightVersion, 
  currentContent,
  configId,
  onClose 
}: VersionDiffViewProps) {
  const { theme, currentFormat } = useAppStore();
  const [leftContent, setLeftContent] = useState<string | null>(null);
  const [rightContent, setRightContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContents = async () => {
      if (!configId) {
        setError('No config selected');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const leftFull = await invoke<ConfigVersion>('load_version', { 
          configId, 
          versionId: leftVersion.id 
        });
        setLeftContent(leftFull.content);

        if (rightVersion === 'current') {
          setRightContent(currentContent);
        } else {
          const rightFull = await invoke<ConfigVersion>('load_version', { 
            configId, 
            versionId: rightVersion.id 
          });
          setRightContent(rightFull.content);
        }
        setIsLoading(false);
      } catch (err) {
        setError(String(err));
        setIsLoading(false);
      }
    };

    loadContents();
  }, [leftVersion.id, rightVersion, configId, currentContent]);

  const getLanguage = () => {
    switch (currentFormat) {
      case 'json': return 'json';
      case 'yaml': return 'yaml';
      case 'toml': return 'ini';
      case 'ini': return 'ini';
      case 'md': return 'markdown';
      default: return 'plaintext';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#020617]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {leftVersion.name}
            </span>
            <span className="text-slate-400">vs</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {rightVersion === 'current' ? 'Current Editor' : rightVersion.name}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Diff Editor */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-400">
            {error}
          </div>
        ) : (
          <DiffEditor
            height="100%"
            language={getLanguage()}
            original={leftContent || ''}
            modified={rightContent || ''}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              readOnly: true,
              renderSideBySide: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          />
        )}
      </div>
    </div>
  );
}
