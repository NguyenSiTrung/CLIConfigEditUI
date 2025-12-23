import { type ButtonHTMLAttributes } from 'react';

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md';
}

const sizeStyles = {
  sm: {
    track: 'h-5 w-9',
    thumb: 'h-4 w-4',
    translate: 'translate-x-4',
  },
  md: {
    track: 'h-6 w-11',
    thumb: 'h-5 w-5',
    translate: 'translate-x-5',
  },
};

export function Toggle({
  label,
  description,
  checked,
  onChange,
  size = 'md',
  disabled,
  className = '',
  ...props
}: ToggleProps) {
  const styles = sizeStyles[size];

  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <p className="text-sm font-medium text-slate-700 dark:text-gray-300">
              {label}
            </p>
          )}
          {description && (
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex flex-shrink-0 cursor-pointer rounded-full
          border-2 border-transparent
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          dark:focus:ring-offset-gray-800
          disabled:opacity-50 disabled:cursor-not-allowed
          ${styles.track}
          ${checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-gray-600'}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        <span
          className={`
            pointer-events-none inline-block transform rounded-full
            bg-white shadow ring-0
            transition duration-200 ease-in-out
            ${styles.thumb}
            ${checked ? styles.translate : 'translate-x-0'}
          `.trim().replace(/\s+/g, ' ')}
        />
      </button>
    </div>
  );
}
