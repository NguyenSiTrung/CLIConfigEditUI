import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X, Info } from 'lucide-react';
import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = `toast-${Date.now()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// eslint-disable-next-line react-refresh/only-export-components
export const toast = {
  success: (message: string) => useToastStore.getState().addToast(message, 'success'),
  error: (message: string) => useToastStore.getState().addToast(message, 'error'),
  warning: (message: string) => useToastStore.getState().addToast(message, 'warning'),
  info: (message: string) => useToastStore.getState().addToast(message, 'info'),
};

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: 'dark:bg-green-500/10 bg-green-50 dark:border-green-500/50 border-green-200 dark:text-green-400 text-green-700',
  error: 'dark:bg-red-500/10 bg-red-50 dark:border-red-500/50 border-red-200 dark:text-red-400 text-red-700',
  warning: 'dark:bg-yellow-500/10 bg-amber-50 dark:border-yellow-500/50 border-amber-200 dark:text-yellow-400 text-amber-700',
  info: 'dark:bg-blue-500/10 bg-blue-50 dark:border-blue-500/50 border-blue-200 dark:text-blue-400 text-blue-700',
};

const iconColors = {
  success: 'dark:text-green-400 text-green-600',
  error: 'dark:text-red-400 text-red-600',
  warning: 'dark:text-yellow-400 text-amber-600',
  info: 'dark:text-blue-400 text-blue-600',
};

function ToastItem({ toast: t, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = icons[t.type];

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm
                  shadow-lg transition-all duration-300 ease-out
                  ${colors[t.type]}
                  ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${iconColors[t.type]}`} />
      <span className="text-sm font-medium flex-1">{t.message}</span>
      <button
        onClick={onRemove}
        className="p-1 rounded dark:hover:bg-white/10 hover:bg-black/5 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      role="status"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={() => removeToast(t.id)} />
        </div>
      ))}
    </div>
  );
}
