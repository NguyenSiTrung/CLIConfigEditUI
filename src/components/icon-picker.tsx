import { useState, useRef, useEffect } from 'react';

const ICON_OPTIONS = ['🔧', '⚙️', '🛠️', '📦', '🚀', '💻', '🔌', '📝', '🎯', '🗂️', '💾', '🔒', '🌐', '🔥', '⚡', '🎨', '📊', '🔗'];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && popoverRef.current && containerRef.current) {
      const popover = popoverRef.current;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      
      // Check if popover would overflow bottom
      const spaceBelow = window.innerHeight - containerRect.bottom;
      const spaceAbove = containerRect.top;
      
      if (spaceBelow < popoverRect.height + 8 && spaceAbove > popoverRect.height + 8) {
        popover.style.bottom = '100%';
        popover.style.top = 'auto';
        popover.style.marginBottom = '4px';
        popover.style.marginTop = '0';
      } else {
        popover.style.top = '100%';
        popover.style.bottom = 'auto';
        popover.style.marginTop = '4px';
        popover.style.marginBottom = '0';
      }

      // Check if popover would overflow right
      const spaceRight = window.innerWidth - containerRect.left;
      if (spaceRight < popoverRect.width) {
        popover.style.left = 'auto';
        popover.style.right = '0';
      } else {
        popover.style.left = '0';
        popover.style.right = 'auto';
      }
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 flex items-center justify-center text-2xl rounded-xl border-2 
                   dark:bg-gray-900/50 bg-slate-50 
                   transition-all duration-200 hover:scale-105
                   ${isOpen 
                     ? 'border-blue-500 ring-2 ring-blue-500/20 dark:ring-blue-400/20' 
                     : 'dark:border-gray-700/50 border-slate-200 hover:border-blue-400'}`}
        title="Choose icon"
      >
        {value}
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-30 md:hidden" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popover */}
          <div
            ref={popoverRef}
            className="absolute z-40 dark:bg-gray-800 bg-white rounded-xl shadow-xl 
                       border dark:border-gray-700 border-slate-200 p-3
                       animate-in fade-in zoom-in-95 duration-150"
            style={{ minWidth: '200px' }}
          >
            <div className="text-xs font-medium dark:text-gray-400 text-slate-500 mb-2 px-1">
              Choose an icon
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-8 h-8 flex items-center justify-center text-lg rounded-lg 
                             transition-all duration-150 hover:scale-110
                             ${value === opt 
                               ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50' 
                               : 'dark:hover:bg-gray-700 hover:bg-slate-100'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
