import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { ask } from '@tauri-apps/plugin-dialog';
import { createPortal } from 'react-dom';
import { ConfigFile } from '@/types';
import { useAppStore } from '@/stores/app-store';

interface ConfigFileItemProps {
  configFile: ConfigFile;
  isActive: boolean;
  hasUnsavedChanges?: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const FORMAT_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  json: { label: 'JSON', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100/80 dark:bg-amber-500/15' },
  yaml: { label: 'YAML', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100/80 dark:bg-emerald-500/15' },
  toml: { label: 'TOML', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100/80 dark:bg-orange-500/15' },
  ini: { label: 'INI', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100/80 dark:bg-sky-500/15' },
  md: { label: 'MD', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100/80 dark:bg-purple-500/15' },
};

export const ConfigFileItem = memo(function ConfigFileItem({
  configFile,
  isActive,
  hasUnsavedChanges = false,
  onSelect,
  onEdit,
  onDelete,
}: ConfigFileItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const tooltipTimeoutRef = useRef<number | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const confirmBeforeDelete = useAppStore((state) => state.behaviorSettings.confirmBeforeDelete);

  const formatBadge = FORMAT_BADGES[configFile.format] || FORMAT_BADGES.json;
  const tooltipContent = configFile.path + (configFile.jsonPath ? ` → ${configFile.jsonPath}` : '');

  const updateMenuPosition = useCallback(() => {
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 130,
      });
    }
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    
    updateMenuPosition();
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    
    const handleScroll = () => {
      setMenuOpen(false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [menuOpen, updateMenuPosition]);

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    tooltipTimeoutRef.current = window.setTimeout(() => {
      setShowTooltip(true);
    }, 600);
  };

  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTooltip(false);
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (confirmBeforeDelete) {
      const confirmed = await ask(`Delete "${configFile.label}"?`, {
        title: 'Confirm Delete',
        kind: 'warning',
      });
      if (!confirmed) return;
    }
    onDelete();
  };

  return (
    <div
      className="relative group/config"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={onSelect}
        className={`w-full px-2.5 py-2 pr-8 text-left flex items-center gap-2.5 text-sm rounded-xl
                   transition-[background-color,color,box-shadow] duration-200 relative overflow-hidden
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 
                   focus-visible:ring-offset-1 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900
                   ${isActive
            ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-500/15 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 hover:shadow-sm'
          }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-indigo-500 rounded-full 
                         animate-in slide-in-from-left-1 duration-200" />
        )}
        
        <span 
          className={`flex-shrink-0 px-1.5 py-0.5 text-[11px] font-bold tracking-wide rounded-md 
                     ${formatBadge.color} ${formatBadge.bg}
                     transition-transform duration-200 group-hover/config:scale-105`}
        >
          {formatBadge.label}
        </span>
        
        <span className="truncate font-medium flex-1" title={configFile.label}>
          {configFile.label}
        </span>
        
        {hasUnsavedChanges && (
          <span 
            className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-500 animate-pulse"
            title="Unsaved changes"
            aria-label="Unsaved changes"
          />
        )}
      </button>

      {showTooltip && !menuOpen && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-30 pointer-events-none 
                       animate-in fade-in slide-in-from-left-1 duration-200">
          <div className="bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-xl px-3 py-2.5 
                         shadow-xl max-w-[300px] border border-slate-700/50">
            <div className="font-semibold text-slate-100 mb-1">{configFile.label}</div>
            <div className="text-slate-400 text-xs font-mono break-all leading-relaxed">
              {tooltipContent}
            </div>
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 
                         bg-slate-900 dark:bg-slate-800 rotate-45 border-l border-b border-slate-700/50" />
        </div>
      )}

      <button
        ref={menuButtonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-150
                   ${menuOpen
            ? 'opacity-100 bg-slate-200 dark:bg-slate-700'
            : 'opacity-0 group-hover/config:opacity-100 group-focus-within/config:opacity-100'}
                   hover:bg-slate-200 dark:hover:bg-slate-700 
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
                   active:scale-95`}
        style={{ visibility: menuOpen ? 'visible' : undefined }}
        aria-label="Open config menu"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {menuOpen && createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 
                    bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl
                    rounded-xl shadow-xl py-1.5 min-w-[130px]
                    border border-slate-200/80 dark:border-slate-700/50
                    animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150"
          style={{ top: menuPosition.top, left: menuPosition.left }}
          role="menu"
        >
          <button
            type="button"
            onClick={() => {
              onEdit();
              setMenuOpen(false);
            }}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2.5 rounded-lg mx-1
                        text-slate-700 dark:text-slate-200 
                        hover:bg-indigo-50 dark:hover:bg-indigo-500/10 
                        hover:text-indigo-600 dark:hover:text-indigo-400
                        transition-colors duration-150"
              style={{ width: 'calc(100% - 8px)' }}
              role="menuitem"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <div className="my-1 mx-2 border-t border-slate-200/60 dark:border-slate-700/50" />
            <button
              type="button"
              onClick={handleDelete}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2.5 rounded-lg mx-1
                        text-rose-500 dark:text-rose-400
                        hover:bg-rose-50 dark:hover:bg-rose-900/20 
                        hover:text-rose-600 dark:hover:text-rose-300
                        transition-colors duration-150"
              style={{ width: 'calc(100% - 8px)' }}
              role="menuitem"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>,
        document.body
      )}
    </div>
  );
});
