import { useState, useEffect, useRef } from 'react';
import { X, Lightbulb } from 'lucide-react';

const STORAGE_KEY = 'cli-config-editor-shown-hints';

function getShownHints(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // Ignore parse errors
  }
  return new Set();
}

function markHintAsShown(hintId: string): void {
  const shown = getShownHints();
  shown.add(hintId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...shown]));
}

interface OnboardingTooltipProps {
  id: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  delay?: number;
}

export function OnboardingTooltip({
  id,
  title,
  description,
  position = 'bottom',
  children,
  delay = 500,
}: OnboardingTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shownHints = getShownHints();
    if (!shownHints.has(id)) {
      const timer = setTimeout(() => {
        setShouldShow(true);
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [id, delay]);

  const handleDismiss = () => {
    setIsVisible(false);
    markHintAsShown(id);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-indigo-600',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-indigo-600',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-indigo-600',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-indigo-600',
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {children}
      {shouldShow && isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[position]} animate-in fade-in slide-in-from-bottom-1 duration-200`}
        >
          <div className="bg-indigo-600 text-white rounded-lg shadow-xl shadow-indigo-500/30 p-3 min-w-[220px] max-w-[280px]">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-200" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm mb-1">{title}</div>
                <div className="text-xs text-indigo-100 leading-relaxed">{description}</div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-0.5 rounded hover:bg-indigo-500 transition-colors flex-shrink-0"
                aria-label="Dismiss hint"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div
            className={`absolute w-0 h-0 border-[6px] ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
}

export function resetOnboardingHints(): void {
  localStorage.removeItem(STORAGE_KEY);
}
