import { type ReactNode } from 'react';
import { type AccentColor, ACCENT_COLORS } from '@/constants/tool-icons';

export type IconContainerSize = 'sm' | 'md' | 'lg';

export interface IconContainerProps {
  children: ReactNode;
  size?: IconContainerSize;
  active?: boolean;
  accent?: AccentColor;
  className?: string;
}

const sizeStyles: Record<IconContainerSize, { container: string; icon: string }> = {
  sm: { container: 'w-5 h-5 rounded-md', icon: 'w-3.5 h-3.5' },
  md: { container: 'w-6 h-6 rounded-lg', icon: 'w-4 h-4' },
  lg: { container: 'w-8 h-8 rounded-lg', icon: 'w-5 h-5' },
};

export function IconContainer({
  children,
  size = 'md',
  active = false,
  accent = 'indigo',
  className = '',
}: IconContainerProps) {
  const { container: containerSize } = sizeStyles[size];
  const accentColors = ACCENT_COLORS[accent];

  const baseStyles = 'flex items-center justify-center transition-all duration-150';
  const defaultBg = 'bg-slate-100 dark:bg-slate-800';
  const activeBg = accentColors.activeBg;
  const hoverStyles = 'hover:scale-105';

  return (
    <div
      className={`
        ${baseStyles}
        ${containerSize}
        ${active ? activeBg : defaultBg}
        ${hoverStyles}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </div>
  );
}

IconContainer.displayName = 'IconContainer';
