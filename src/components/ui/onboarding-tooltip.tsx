import { useState, useEffect, useRef } from 'react';
import { X, Lightbulb } from 'lucide-react';
import { getShownHints, markHintAsShown } from '@/utils/onboarding-hints';

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
  delay = 1500,
}: OnboardingTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shown = getShownHints();
    if (!shown.has(id)) {
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [id, delay]);

  useEffect(() => {
    if (shouldShow) {
      setIsVisible(true);
    }
  }, [shouldShow]);

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
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-indigo-500',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-indigo-500',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-indigo-500',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-indigo-500',
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[position]} animate-in fade-in slide-in-from-bottom-1 duration-200`}
          role="tooltip"
        >
          <div className="relative bg-indigo-500 text-white rounded-lg shadow-xl max-w-xs p-3">
            <div
              className={`absolute w-0 h-0 border-[6px] ${arrowClasses[position]}`}
            />
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Dismiss hint"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="flex items-start gap-2 pr-6">
              <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-300" />
              <div>
                <h4 className="font-medium text-sm">{title}</h4>
                <p className="text-xs text-indigo-100 mt-1">{description}</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="mt-2 w-full py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 rounded transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
