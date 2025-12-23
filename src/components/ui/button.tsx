import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shortcut?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
    text-white border-transparent
    shadow-sm hover:shadow-md
    focus:ring-indigo-500
  `,
  secondary: `
    bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
    text-white border-transparent
    shadow-sm hover:shadow-md
    focus:ring-emerald-500
  `,
  ghost: `
    bg-transparent hover:bg-slate-100 dark:hover:bg-white/10 active:bg-slate-200 dark:active:bg-white/20
    text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white
    border-transparent
    focus:ring-slate-400
  `,
  danger: `
    bg-rose-600 hover:bg-rose-700 active:bg-rose-800
    text-white border-transparent
    shadow-sm hover:shadow-md
    focus:ring-rose-500
  `,
  outline: `
    bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-white/10
    text-slate-700 dark:text-slate-300
    border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/30
    focus:ring-indigo-500
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-md',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      shortcut,
      leftIcon,
      rightIcon,
      isLoading,
      fullWidth,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center font-medium
          border transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          dark:focus:ring-offset-slate-900
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
        {shortcut && (
          <kbd className="ml-2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-current opacity-60 bg-black/10 dark:bg-white/10 rounded">
            {shortcut}
          </kbd>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
