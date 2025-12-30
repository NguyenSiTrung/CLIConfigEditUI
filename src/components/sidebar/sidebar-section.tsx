import { memo, useState, useRef, useMemo, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { ACCENT_COLORS, type AccentColor } from '@/constants/tool-icons';

interface SidebarSectionProps {
  title: string;
  count: number;
  accent?: AccentColor;
  defaultExpanded?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  children: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  tooltip?: string;
}

export const SidebarSection = memo(function SidebarSection({
  title,
  count,
  accent = 'indigo',
  defaultExpanded = true,
  isExpanded: controlledExpanded,
  onToggle,
  children,
  action,
  icon,
  tooltip,
}: SidebarSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isExpanded = controlledExpanded ?? internalExpanded;
  const colors = ACCENT_COLORS[accent];

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const listId = useMemo(
    () => `section-${title.toLowerCase().replace(/\s+/g, '-')}`,
    [title]
  );

  return (
    <div className="mb-3">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={isExpanded}
          aria-controls={listId}
          title={tooltip}
          className={`flex-1 px-2.5 py-2 flex items-center justify-between text-xs font-semibold 
                     text-slate-600 dark:text-slate-300 uppercase tracking-wider 
                     hover:text-slate-800 dark:hover:text-slate-100 
                     rounded-lg hover:bg-white/70 dark:hover:bg-slate-800/50
                     transition-all duration-200
                     focus-visible:outline-none focus-visible:ring-2 ${colors.ring} 
                     focus-visible:ring-offset-1 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900`}
        >
          <span className="flex items-center gap-2">
            <span 
              className={`flex-shrink-0 transition-transform duration-200 ease-out
                         ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </span>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{title}</span>
          </span>
          <span 
            className={`px-2 py-0.5 text-[11px] rounded-full font-medium
                       ${colors.badge} ${colors.badgeText}
                       transition-colors duration-200`}
          >
            {count}
          </span>
        </button>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>

      <div
        ref={contentRef}
        id={listId}
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out
                   ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="mt-1.5 pt-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
});
