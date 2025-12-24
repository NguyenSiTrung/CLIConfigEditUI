import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';

export function useSystemTheme() {
  const theme = useAppStore((state) => state.theme);
  const setResolvedTheme = useAppStore((state) => state.setResolvedTheme);

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
    };

    handleChange(mediaQuery);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, setResolvedTheme]);
}
