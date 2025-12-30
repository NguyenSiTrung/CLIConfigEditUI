import { useState, useRef, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { 
  AI_PRESET_ICONS, 
  LUCIDE_ICON_OPTIONS, 
  EMOJI_CATEGORIES,
} from '@/constants/icon-presets';

type TabType = 'presets' | 'icons' | 'emojis';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('emojis');
  const [search, setSearch] = useState('');
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

  const filteredIcons = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return LUCIDE_ICON_OPTIONS;
    return LUCIDE_ICON_OPTIONS.filter(icon => 
      icon.name.toLowerCase().includes(q) || 
      icon.category.toLowerCase().includes(q)
    );
  }, [search]);

  const filteredPresets = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return AI_PRESET_ICONS;
    return AI_PRESET_ICONS.filter(preset => 
      preset.name.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSelectEmoji = (emoji: string) => {
    onChange(emoji);
    setIsOpen(false);
  };

  const handleSelectIcon = (iconName: string) => {
    onChange(`lucide:${iconName}`);
    setIsOpen(false);
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = AI_PRESET_ICONS.find(p => p.id === presetId);
    if (preset) {
      onChange(preset.emoji);
      setIsOpen(false);
    }
  };

  const displayValue = value.startsWith('lucide:') 
    ? (() => {
        const iconName = value.replace('lucide:', '');
        const icon = LUCIDE_ICON_OPTIONS.find(i => i.name === iconName);
        if (icon) {
          const IconComponent = icon.icon;
          return <IconComponent className="w-6 h-6 text-slate-600 dark:text-slate-300" />;
        }
        return value;
      })()
    : value;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 flex items-center justify-center text-2xl rounded-xl border-2 
                   dark:bg-slate-900/50 bg-slate-50 
                   transition-all duration-200 hover:scale-105
                   ${isOpen 
                     ? 'border-violet-500 ring-2 ring-violet-500/20 dark:ring-violet-400/20' 
                     : 'dark:border-slate-700/50 border-slate-200 hover:border-violet-400'}`}
        title="Choose icon"
      >
        {displayValue}
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30 md:hidden" 
            onClick={() => setIsOpen(false)}
          />
          
          <div
            ref={popoverRef}
            className="absolute z-40 dark:bg-slate-800 bg-white rounded-xl shadow-xl 
                       border dark:border-slate-700 border-slate-200 overflow-hidden
                       animate-in fade-in zoom-in-95 duration-150"
            style={{ width: '280px' }}
          >
            {/* Tabs */}
            <div className="flex border-b dark:border-slate-700 border-slate-200">
              {(['presets', 'icons', 'emojis'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setActiveTab(tab); setSearch(''); }}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors
                             ${activeTab === tab
                               ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-500 -mb-px bg-violet-50/50 dark:bg-violet-500/10'
                               : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                             }`}
                >
                  {tab === 'presets' ? 'AI Tools' : tab === 'icons' ? 'Icons' : 'Emojis'}
                </button>
              ))}
            </div>

            {/* Search (for icons and presets) */}
            {(activeTab === 'icons' || activeTab === 'presets') && (
              <div className="p-2 border-b dark:border-slate-700 border-slate-200">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={activeTab === 'icons' ? 'Search icons...' : 'Search AI tools...'}
                    className="w-full pl-7 pr-2 py-1.5 text-xs rounded-lg
                               dark:bg-slate-900 bg-slate-50 
                               dark:text-slate-200 text-slate-700
                               dark:border-slate-700 border-slate-200 border
                               focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-3 max-h-64 overflow-y-auto">
              {/* AI Presets Tab */}
              {activeTab === 'presets' && (
                <div className="grid grid-cols-3 gap-2">
                  {filteredPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg 
                                 transition-all duration-150 hover:scale-105
                                 ${value === preset.emoji
                                   ? 'bg-violet-100 dark:bg-violet-500/20 ring-2 ring-violet-400'
                                   : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                 }`}
                    >
                      <span className="text-xl">{preset.emoji}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full text-center">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                  {filteredPresets.length === 0 && (
                    <div className="col-span-3 py-4 text-center text-xs text-slate-400">
                      No AI tools match "{search}"
                    </div>
                  )}
                </div>
              )}

              {/* Icons Tab */}
              {activeTab === 'icons' && (
                <div className="grid grid-cols-6 gap-1.5">
                  {filteredIcons.map((iconOpt) => {
                    const IconComponent = iconOpt.icon;
                    const isSelected = value === `lucide:${iconOpt.name}`;
                    return (
                      <button
                        key={iconOpt.name}
                        type="button"
                        onClick={() => handleSelectIcon(iconOpt.name)}
                        title={iconOpt.name}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg 
                                   transition-all duration-150 hover:scale-110
                                   ${isSelected
                                     ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-400/50'
                                     : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                   }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </button>
                    );
                  })}
                  {filteredIcons.length === 0 && (
                    <div className="col-span-6 py-4 text-center text-xs text-slate-400">
                      No icons match "{search}"
                    </div>
                  )}
                </div>
              )}

              {/* Emojis Tab */}
              {activeTab === 'emojis' && (
                <div className="space-y-3">
                  {EMOJI_CATEGORIES.map((category) => (
                    <div key={category.name}>
                      <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                        {category.name}
                      </div>
                      <div className="grid grid-cols-6 gap-1.5">
                        {category.emojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleSelectEmoji(emoji)}
                            className={`w-9 h-9 flex items-center justify-center text-lg rounded-lg 
                                       transition-all duration-150 hover:scale-110
                                       ${value === emoji
                                         ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-400/50'
                                         : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                       }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
