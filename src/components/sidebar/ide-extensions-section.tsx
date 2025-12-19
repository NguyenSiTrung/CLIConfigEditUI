import { useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { IDE_PLATFORMS, IDE_EXTENSIONS } from '@/utils/cli-tools';
import { PLATFORM_ICONS, DEFAULT_PLATFORM_ICON, EXTENSION_ICON, ACCENT_COLORS } from '@/constants/tool-icons';
import { SidebarSection } from './sidebar-section';

interface IdeExtensionsSectionProps {
  onExtensionConfigSelect?: (platformId: string, extensionId: string, settingPath: string | null) => void;
}

export function IdeExtensionsSection({ onExtensionConfigSelect }: IdeExtensionsSectionProps) {
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());
  const [expandedExtensions, setExpandedExtensions] = useState<Set<string>>(new Set());
  const [expandedAllSettings, setExpandedAllSettings] = useState<Set<string>>(new Set());
  const [settingStatus, setSettingStatus] = useState<Record<string, 'exists' | 'not-found' | 'loading'>>({});
  const [currentOs, setCurrentOs] = useState<string>('');

  useEffect(() => {
    invoke<string>('get_current_os').then(setCurrentOs);
  }, []);

  const checkSettingsExistence = useCallback(async (platformId: string) => {
    const platform = IDE_PLATFORMS.find(p => p.id === platformId);
    if (!platform || !currentOs) return;

    const settingsPath = platform.settingsPaths[currentOs as keyof typeof platform.settingsPaths];
    if (!settingsPath) return;

    for (const extConfig of platform.extensions || []) {
      const extension = IDE_EXTENSIONS.find(e => e.id === extConfig.extensionId);
      if (!extension?.suggestedSettings) continue;

      for (const setting of extension.suggestedSettings) {
        const fullPath = `${extension.settingsPrefix}.${setting.jsonPath}`;
        const key = `${platformId}-${fullPath}`;

        setSettingStatus(prev => ({ ...prev, [key]: 'loading' }));

        try {
          await invoke<string>('read_json_path', {
            path: settingsPath,
            jsonPath: fullPath,
          });
          setSettingStatus(prev => ({ ...prev, [key]: 'exists' }));
        } catch {
          setSettingStatus(prev => ({ ...prev, [key]: 'not-found' }));
        }
      }
    }
  }, [currentOs]);

  const togglePlatform = (platformId: string) => {
    setExpandedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(platformId)) {
        next.delete(platformId);
      } else {
        next.add(platformId);
        checkSettingsExistence(platformId);
      }
      return next;
    });
  };

  const toggleExtension = (key: string) => {
    setExpandedExtensions(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleAllSettings = (key: string) => {
    setExpandedAllSettings(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const colors = ACCENT_COLORS.emerald;

  return (
    <SidebarSection
      title="IDE Extensions"
      count={IDE_PLATFORMS.length}
      accent="emerald"
      defaultExpanded={true}
    >
      <ul className="space-y-0.5">
        {IDE_PLATFORMS.map((platform) => (
          <li key={platform.id} className="mb-0.5">
            <button
              type="button"
              onClick={() => togglePlatform(platform.id)}
              aria-expanded={expandedPlatforms.has(platform.id)}
              className={`w-full px-2 py-2 text-left flex items-center gap-2 text-sm rounded-xl
                         transition-all duration-200 group
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 
                         focus-visible:ring-offset-1 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900
                         ${expandedPlatforms.has(platform.id)
                  ? 'bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <span 
                className={`flex-shrink-0 transition-transform duration-200 ease-out
                           ${expandedPlatforms.has(platform.id) ? 'rotate-0' : '-rotate-90'}`}
              >
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                {PLATFORM_ICONS[platform.id] || DEFAULT_PLATFORM_ICON}
              </span>
              <span className="truncate font-medium flex-1" title={platform.name}>
                {platform.name}
              </span>
              {platform.extensions && platform.extensions.length > 0 && (
                <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-medium
                                ${expandedPlatforms.has(platform.id) 
                    ? `${colors.badge} ${colors.badgeText}` 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                  {platform.extensions.length}
                </span>
              )}
            </button>

            {expandedPlatforms.has(platform.id) && platform.extensions && (
              <ul className="ml-3 pl-3 border-l-2 border-emerald-200/50 dark:border-emerald-700/30 my-1 space-y-0.5
                            animate-in fade-in slide-in-from-top-1 duration-200">
                {platform.extensions.map((extConfig) => {
                  const extension = IDE_EXTENSIONS.find(e => e.id === extConfig.extensionId);
                  const extKey = `${platform.id}-${extConfig.extensionId}`;

                  return (
                    <li key={extConfig.extensionId}>
                      <button
                        type="button"
                        onClick={() => toggleExtension(extKey)}
                        aria-expanded={expandedExtensions.has(extKey)}
                        className={`w-full px-2 py-1.5 text-left flex items-center gap-2 text-sm rounded-lg
                                   transition-all duration-200 relative
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 
                                   focus-visible:ring-offset-1 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900
                                   ${expandedExtensions.has(extKey)
                            ? 'text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-500/10'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                      >
                        <span className={`flex-shrink-0 transition-transform duration-200 ${expandedExtensions.has(extKey) ? 'rotate-0' : '-rotate-90'}`}>
                          <ChevronDown className="w-3 h-3 opacity-50" />
                        </span>
                        {EXTENSION_ICON}
                        <span className="truncate font-medium flex-1" title={extConfig.label}>
                          {extConfig.label}
                        </span>
                      </button>

                      {expandedExtensions.has(extKey) && (
                        <ul className="ml-2.5 pl-3 border-l-2 border-amber-200/50 dark:border-amber-700/30 my-1 space-y-0.5
                                      animate-in fade-in slide-in-from-top-1 duration-150">
                          <li>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => toggleAllSettings(extKey)}
                                aria-expanded={expandedAllSettings.has(extKey)}
                                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 
                                          transition-colors duration-150"
                              >
                                <span className={`block transition-transform duration-200 ${expandedAllSettings.has(extKey) ? 'rotate-0' : '-rotate-90'}`}>
                                  <ChevronDown className="w-3 h-3" />
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onExtensionConfigSelect?.(
                                  platform.id,
                                  extConfig.extensionId,
                                  null
                                )}
                                className="flex-1 px-2 py-1.5 text-left flex items-center gap-2 text-xs rounded-lg
                                          transition-all duration-150 font-medium
                                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 
                                          focus-visible:ring-offset-1 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900
                                          text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <span className="text-sm">📋</span>
                                <span className="truncate flex-1">All Settings</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                  {extension?.settingsPrefix}.*
                                </span>
                              </button>
                            </div>

                            {expandedAllSettings.has(extKey) && extension?.suggestedSettings && (
                              <ul className="ml-2.5 pl-3 border-l-2 border-blue-200/50 dark:border-blue-700/30 my-1 space-y-0.5
                                            animate-in fade-in slide-in-from-top-1 duration-150">
                                {extension.suggestedSettings.map((setting) => {
                                  const fullPath = `${extension.settingsPrefix}.${setting.jsonPath}`;
                                  const statusKey = `${platform.id}-${fullPath}`;
                                  const status = settingStatus[statusKey];

                                  return (
                                    <li key={setting.jsonPath}>
                                      <button
                                        type="button"
                                        onClick={() => onExtensionConfigSelect?.(
                                          platform.id,
                                          extConfig.extensionId,
                                          fullPath
                                        )}
                                        className="w-full px-2 py-1.5 text-left flex items-center gap-2 text-xs rounded-lg
                                                  transition-all duration-150
                                                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 
                                                  focus-visible:ring-offset-1 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900
                                                  text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50
                                                  hover:text-indigo-600 dark:hover:text-indigo-400"
                                      >
                                        <span className="text-sm opacity-70">{setting.icon || '⚙️'}</span>
                                        <span className="truncate flex-1">{setting.label}</span>
                                        {status === 'loading' && (
                                          <span className="px-1.5 py-0.5 text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full animate-pulse">
                                            ...
                                          </span>
                                        )}
                                        {status === 'exists' && (
                                          <span className="px-1.5 py-0.5 text-[9px] bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                                            ✓
                                          </span>
                                        )}
                                        {status === 'not-found' && (
                                          <span className="px-1.5 py-0.5 text-[9px] bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full">
                                            −
                                          </span>
                                        )}
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </li>
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </SidebarSection>
  );
}
