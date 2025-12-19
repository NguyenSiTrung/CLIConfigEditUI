import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { ACCENT_COLORS, type AccentColor } from '@/constants/tool-icons';

interface CollapsibleTreeItemProps {
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  isExpanded: boolean;
  isActive?: boolean;
  isChildActive?: boolean;
  accent?: AccentColor;
  onToggle: () => void;
  onClick?: () => void;
  children?: ReactNode;
  actions?: ReactNode;
}

export function CollapsibleTreeItem({
  label,
  icon,
  badge,
  isExpanded,
  isActive = false,
  isChildActive = false,
  accent = 'indigo',
  onToggle,
  onClick,
  children,
  actions,
}: CollapsibleTreeItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);
  const colors = ACCENT_COLORS[accent];
  const listId = `tree-item-${label.toLowerCase().replace(/\s+/g, '-')}-content`;

  useEffect(() => {
    if (contentRef.current) {
      const observer = new ResizeObserver(() => {
        if (contentRef.current) {
          setContentHeight(contentRef.current.scrollHeight);
        }
      });
      observer.observe(contentRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, children]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      onToggle();
    }
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  return (
    <li className="mb-0.5 group/tree-item">
      <div className="relative flex items-center group/row">
        <button
          type="button"
          onClick={handleClick}
          aria-expanded={isExpanded}
          aria-controls={listId}
          className={`flex-1 px-2 py-2 text-left flex items-center gap-2 text-sm rounded-xl
                     transition-all duration-200 group/tool relative overflow-hidden
                     focus-visible:outline-none focus-visible:ring-2 ${colors.ring}
                     focus-visible:ring-offset-1 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900
                     ${isActive
              ? `${colors.activeBg} ${colors.activeText} font-medium shadow-sm`
              : isChildActive
                ? `${colors.activeBg}/60 ${colors.activeText}/80`
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          {isActive && (
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 ${colors.border} rounded-full`} />
          )}
          
          <span
            onClick={handleChevronClick}
            className={`flex-shrink-0 p-0.5 -ml-0.5 rounded transition-all duration-200 
                       hover:bg-slate-200/50 dark:hover:bg-slate-700/50
                       ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
          >
            <ChevronDown 
              className={`w-3.5 h-3.5 transition-colors duration-200
                         ${isActive ? colors.badgeText : 'text-slate-400 dark:text-slate-500'}`} 
            />
          </span>
          
          {icon && (
            <span className={`flex-shrink-0 transition-transform duration-200 group-hover/tool:scale-110
                            ${isActive ? colors.badgeText : 'text-slate-500 dark:text-slate-500'}`}>
              {icon}
            </span>
          )}
          
          <span className="truncate flex-1" title={label}>
            {label}
          </span>
          
          {badge}
        </button>
        
        {actions && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 
                         opacity-0 group-hover/row:opacity-100 transition-opacity duration-150">
            {actions}
          </div>
        )}
      </div>

      <div
        ref={contentRef}
        id={listId}
        className="overflow-hidden transition-all duration-200 ease-out"
        style={{ 
          maxHeight: isExpanded ? contentHeight : 0,
          opacity: isExpanded ? 1 : 0,
        }}
      >
        {children && (
          <div className="relative ml-3 pl-3 my-1 space-y-0.5
                         border-l-2 border-slate-200/70 dark:border-slate-700/50
                         hover:border-slate-300 dark:hover:border-slate-600 transition-colors duration-200">
            {children}
          </div>
        )}
      </div>
    </li>
  );
}
