import { memo, type ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableToolItemProps {
  id: string;
  children: ReactNode;
  disabled?: boolean;
}

export const SortableToolItem = memo(function SortableToolItem({
  id,
  children,
  disabled = false,
}: SortableToolItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      {!disabled && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2
                     opacity-0 pointer-events-none group-hover/sortable:opacity-100 group-hover/sortable:pointer-events-auto
                     cursor-grab active:cursor-grabbing
                     p-1 rounded text-slate-300 dark:text-slate-600
                     hover:text-slate-400 dark:hover:text-slate-500
                     transition-opacity duration-150 z-10"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      )}
      {children}
    </div>
  );
});
