import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';

export function useReducedMotion() {
  const reduceMotion = useAppStore((state) => state.behaviorSettings.reduceMotion);

  useEffect(() => {
    const applyReducedMotion = (shouldReduce: boolean) => {
      document.documentElement.classList.toggle('reduce-motion', shouldReduce);
    };

    if (reduceMotion === 'on') {
      applyReducedMotion(true);
      return;
    }
    
    if (reduceMotion === 'off') {
      applyReducedMotion(false);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      applyReducedMotion(e.matches);
    };

    handleChange(mediaQuery);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [reduceMotion]);
}
