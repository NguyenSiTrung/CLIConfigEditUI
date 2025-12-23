import { type ReactNode, type HTMLAttributes } from 'react';

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function SectionHeader({
  title,
  description,
  icon,
  action,
  className = '',
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 mb-4 ${className}`}
      {...props}
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="flex-shrink-0 p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
