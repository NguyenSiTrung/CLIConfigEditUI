import { type ReactNode, type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variantStyles: Record<NonNullable<CardProps['variant']>, string> = {
  default: `
    bg-white dark:bg-gray-800
    border border-slate-200 dark:border-gray-700/50
    shadow-sm
  `,
  elevated: `
    bg-white dark:bg-gray-800
    border border-slate-200 dark:border-gray-700/50
    shadow-lg
  `,
  outline: `
    bg-transparent
    border border-slate-200 dark:border-gray-700/50
  `,
  ghost: `
    bg-slate-50 dark:bg-gray-900/50
    border border-transparent
  `,
};

const paddingStyles: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </div>
  );
}
