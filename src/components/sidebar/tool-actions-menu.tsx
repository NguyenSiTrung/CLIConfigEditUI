import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { MoreVertical, Pencil, Trash2, Copy, FolderPlus } from 'lucide-react';
import { ask } from '@tauri-apps/plugin-dialog';
import { createPortal } from 'react-dom';

interface ToolActionsMenuProps {
  itemName: string;
  confirmBeforeDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onAddConfig?: () => void;
  size?: 'sm' | 'md';
}

export const ToolActionsMenu = memo(function ToolActionsMenu({
  itemName,
  confirmBeforeDelete = true,
  onEdit,
  onDelete,
  onDuplicate,
  onAddConfig,
  size = 'sm',
}: ToolActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updateMenuPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 140,
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, updateMenuPosition]);

  const handleDelete = useCallback(async () => {
    setIsOpen(false);
    
    if (confirmBeforeDelete) {
      const confirmed = await ask(`Delete "${itemName}"?`, {
        title: 'Confirm Delete',
        kind: 'warning',
      });
      if (!confirmed) return;
    }
    
    onDelete?.();
  }, [confirmBeforeDelete, itemName, onDelete]);

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const buttonPadding = size === 'sm' ? 'p-1' : 'p-1.5';
  const menuPadding = size === 'sm' ? 'py-1' : 'py-1.5';

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`${buttonPadding} rounded-lg transition-all duration-150
                   text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300
                   hover:bg-slate-200/80 dark:hover:bg-slate-700/80
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
                   active:scale-95`}
        aria-label="Open actions menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <MoreVertical className={iconSize} />
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          className={`fixed z-50 
                     bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl
                     rounded-xl shadow-xl ${menuPadding} min-w-[140px]
                     border border-slate-200/80 dark:border-slate-700/50
                     animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150`}
          style={{ top: menuPosition.top, left: menuPosition.left }}
          role="menu"
        >
          {onAddConfig && (
            <button
              type="button"
              onClick={() => {
                onAddConfig();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2.5 rounded-lg
                        text-slate-700 dark:text-slate-200 
                        hover:bg-indigo-50 dark:hover:bg-indigo-500/10 
                        hover:text-indigo-600 dark:hover:text-indigo-400
                        transition-colors duration-150"
              role="menuitem"
            >
              <FolderPlus className={iconSize} />
              Add Config
            </button>
          )}
          
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2.5 rounded-lg
                        text-slate-700 dark:text-slate-200 
                        hover:bg-indigo-50 dark:hover:bg-indigo-500/10 
                        hover:text-indigo-600 dark:hover:text-indigo-400
                        transition-colors duration-150"
              role="menuitem"
            >
              <Pencil className={iconSize} />
              Edit
            </button>
          )}
          
          {onDuplicate && (
            <button
              type="button"
              onClick={() => {
                onDuplicate();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2.5 rounded-lg
                        text-slate-700 dark:text-slate-200 
                        hover:bg-slate-100 dark:hover:bg-slate-700/50 
                        transition-colors duration-150"
              role="menuitem"
            >
              <Copy className={iconSize} />
              Duplicate
            </button>
          )}
          
          {onDelete && (
            <>
              <div className="my-1 mx-2 border-t border-slate-200/80 dark:border-slate-700/50" />
              <button
                type="button"
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2.5 rounded-lg
                          text-rose-500 dark:text-rose-400
                          hover:bg-rose-50 dark:hover:bg-rose-900/20 
                          hover:text-rose-600 dark:hover:text-rose-300
                          transition-colors duration-150"
                role="menuitem"
              >
                <Trash2 className={iconSize} />
                Delete
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
});
