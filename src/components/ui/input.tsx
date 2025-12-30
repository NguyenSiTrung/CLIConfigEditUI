import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
};

const iconSizeStyles = {
  sm: 'pl-8',
  md: 'pl-10',
  lg: 'pl-12',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      size = 'md',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-lg
              bg-white dark:bg-slate-900/50
              border ${hasError
                ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500'
              }
              text-slate-900 dark:text-white
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${sizeStyles[size]}
              ${leftIcon ? iconSizeStyles[size] : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `.trim().replace(/\s+/g, ' ')}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || hint) && (
          <p className={`mt-1.5 text-xs ${hasError ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
