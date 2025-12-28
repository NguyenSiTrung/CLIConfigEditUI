import { memo, useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SidebarSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SidebarSearchBar = memo(function SidebarSearchBar({
  value,
  onChange,
  placeholder = 'Search tools...',
}: SidebarSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape' && value) {
        event.currentTarget.blur();
        onChange('');
      }
    },
    [value, onChange]
  );

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.key === '/' || (event.ctrlKey && event.key === 'f')) && 
          document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className="p-4">
      <div className="relative group">
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 
                     text-slate-400 dark:text-slate-400 
                     group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-200" 
        />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search tools"
          spellCheck={false}
          className="w-full pl-9 pr-8 py-2.5 
                     bg-white/80 dark:bg-slate-700/80 
                     text-slate-800 dark:text-slate-100 
                     rounded-xl text-sm
                     placeholder-slate-400 dark:placeholder-slate-400 
                     border border-slate-200/80 dark:border-slate-600
                     focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-400/40 focus:border-indigo-500/50 dark:focus:border-indigo-400/60
                     shadow-sm hover:shadow-md focus:shadow-md dark:shadow-black/20
                     transition-all duration-200 backdrop-blur-sm"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg 
                       text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 
                       hover:bg-slate-100 dark:hover:bg-slate-700/60 
                       transition-all duration-150 active:scale-95"
            aria-label="Clear search"
            title="Clear search (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
});
