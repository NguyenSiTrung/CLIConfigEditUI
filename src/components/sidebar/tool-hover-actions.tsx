import { memo, useCallback, type MouseEvent } from 'react';
import { Pin, PinOff, Eye, EyeOff } from 'lucide-react';

interface ToolHoverActionsProps {
  toolId: string;
  isPinned: boolean;
  isHidden: boolean;
  onTogglePin: (toolId: string) => void;
  onToggleHide: (toolId: string) => void;
}

export const ToolHoverActions = memo(function ToolHoverActions({
  toolId,
  isPinned,
  isHidden,
  onTogglePin,
  onToggleHide,
}: ToolHoverActionsProps) {
  const handlePinClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      onTogglePin(toolId);
    },
    [onTogglePin, toolId]
  );

  const handleHideClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      onToggleHide(toolId);
    },
    [onToggleHide, toolId]
  );

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={handlePinClick}
        className={`p-1.5 rounded-lg transition-colors duration-150
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
                   ${
                     isPinned
                       ? 'text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 bg-amber-50 dark:bg-amber-900/20'
                       : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                   }`}
        aria-label={isPinned ? 'Unpin tool' : 'Pin tool'}
        title={isPinned ? 'Unpin tool' : 'Pin tool'}
      >
        {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
      </button>

      <button
        type="button"
        onClick={handleHideClick}
        className={`p-1.5 rounded-lg transition-colors duration-150
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
                   ${
                     isHidden
                       ? 'text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20'
                       : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                   }`}
        aria-label={isHidden ? 'Show tool' : 'Hide tool'}
        title={isHidden ? 'Show tool' : 'Hide tool'}
      >
        {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
});
