import { HardDrive, Server } from 'lucide-react';
import type { PathType } from '@/types';

interface PathTypeSelectorProps {
  value: PathType;
  onChange: (value: PathType) => void;
  disabled?: boolean;
}

export function PathTypeSelector({ value, onChange, disabled = false }: PathTypeSelectorProps) {
  const options: { value: PathType; label: string; icon: typeof HardDrive; description: string }[] = [
    {
      value: 'local',
      label: 'Local',
      icon: HardDrive,
      description: 'File on this computer',
    },
    {
      value: 'ssh',
      label: 'SSH Remote',
      icon: Server,
      description: 'File on remote server',
    },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Path Type
      </label>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className={`
                p-3 rounded-lg border text-left transition-all
                ${isSelected
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-indigo-500/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  p-2 rounded-md
                  ${isSelected
                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }
                `}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-sm font-medium ${
                    isSelected 
                      ? 'text-indigo-900 dark:text-indigo-200' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-500">
                    {option.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
