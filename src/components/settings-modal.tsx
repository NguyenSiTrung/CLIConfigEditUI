import { useState } from 'react';
import { Moon, Sun, Monitor, Type, Code, Settings2, Shield, RotateCcw, Keyboard } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { APP_VERSION } from '@/constants/design-tokens';
import { Modal, Toggle, Button } from '@/components/ui';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenKeyboardShortcuts?: () => void;
}

type SettingsTab = 'appearance' | 'editor' | 'backup' | 'behavior';

export function SettingsModal({ isOpen, onClose, onOpenKeyboardShortcuts }: SettingsModalProps) {
  const {
    theme,
    setTheme,
    editorSettings,
    updateEditorSettings,
    backupSettings,
    updateBackupSettings,
    behaviorSettings,
    updateBehaviorSettings,
    resetSettings,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  const handleTabKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    const tabCount = tabs.length;
    let newIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      newIndex = (currentIndex + 1) % tabCount;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      newIndex = (currentIndex - 1 + tabCount) % tabCount;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = tabCount - 1;
    } else {
      return;
    }

    setActiveTab(tabs[newIndex].id);
    const tabButtons = document.querySelectorAll('[role="tab"]');
    (tabButtons[newIndex] as HTMLElement)?.focus();
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'appearance', label: 'Appearance', icon: <Sun className="w-4 h-4" /> },
    { id: 'editor', label: 'Editor', icon: <Code className="w-4 h-4" /> },
    { id: 'backup', label: 'File Backups', icon: <Shield className="w-4 h-4" /> },
    { id: 'behavior', label: 'Behavior', icon: <Settings2 className="w-4 h-4" /> },
  ];

  const footer = (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={resetSettings}
        leftIcon={<RotateCcw className="w-4 h-4" />}
      >
        Reset to Defaults
      </Button>
      {onOpenKeyboardShortcuts && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onClose();
            onOpenKeyboardShortcuts();
          }}
          leftIcon={<Keyboard className="w-4 h-4" />}
        >
          Keyboard Shortcuts
        </Button>
      )}
      <span className="flex-1" />
      <p className="text-xs dark:text-gray-500 text-slate-400">
        CLI Config Editor v{APP_VERSION}
      </p>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      size="lg"
      footer={footer}
    >
      <div 
        className="flex border-b dark:border-gray-700/50 border-slate-200 -mx-6 -mt-4 mb-6"
        role="tablist"
        aria-label="Settings sections"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`settings-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => handleTabKeyDown(e, index)}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors
                       ${activeTab === tab.id
                         ? 'dark:text-indigo-400 text-indigo-600 border-b-2 border-indigo-500 dark:bg-gray-700/30 bg-indigo-50/50'
                         : 'dark:text-slate-300 text-slate-500 dark:hover:text-slate-100 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-gray-700/20'
                       }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6" role="tabpanel" id={`settings-panel-${activeTab}`} aria-labelledby={activeTab}>
        {activeTab === 'appearance' && (
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-3">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('dark')}
                className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2
                           border transition-all
                           ${theme === 'dark'
                             ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                             : 'dark:bg-gray-900/50 bg-slate-50 dark:border-gray-700/50 border-slate-200 dark:text-gray-400 text-slate-500 dark:hover:text-white hover:text-slate-700 dark:hover:border-gray-600 hover:border-slate-300 hover:bg-slate-100'
                           }`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2
                           border transition-all
                           ${theme === 'light'
                             ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                             : 'dark:bg-gray-900/50 bg-slate-50 dark:border-gray-700/50 border-slate-200 dark:text-gray-400 text-slate-500 dark:hover:text-white hover:text-slate-700 dark:hover:border-gray-600 hover:border-slate-300 hover:bg-slate-100'
                           }`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2
                           border transition-all
                           ${theme === 'system'
                             ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                             : 'dark:bg-gray-900/50 bg-slate-50 dark:border-gray-700/50 border-slate-200 dark:text-gray-400 text-slate-500 dark:hover:text-white hover:text-slate-700 dark:hover:border-gray-600 hover:border-slate-300 hover:bg-slate-100'
                           }`}
              >
                <Monitor className="w-4 h-4" />
                System
              </button>
            </div>
            {theme === 'system' && (
              <p className="text-xs dark:text-gray-500 text-slate-400 mt-2">
                Theme will automatically match your system preference
              </p>
            )}
            <p className="text-xs dark:text-gray-500 text-slate-400 mt-2">
              💡 You can also toggle between light and dark mode from the top bar.
            </p>
          </div>
        )}

        {activeTab === 'editor' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
                <Type className="w-4 h-4 inline mr-2" />
                Font Size
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={editorSettings.fontSize}
                  onChange={(e) => updateEditorSettings({ fontSize: Number(e.target.value) })}
                  className="flex-1 accent-indigo-500"
                />
                <span className="w-12 text-center dark:text-gray-300 text-slate-700 font-mono text-sm">
                  {editorSettings.fontSize}px
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
                Tab Size
              </label>
              <div className="flex gap-2">
                {[2, 4, 8].map((size) => (
                  <button
                    key={size}
                    onClick={() => updateEditorSettings({ tabSize: size })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
                               ${editorSettings.tabSize === size
                                 ? 'bg-indigo-600 border-indigo-500 text-white'
                                 : 'dark:bg-gray-900/50 bg-slate-50 dark:border-gray-700/50 border-slate-200 dark:text-gray-400 text-slate-500 hover:border-slate-300 dark:hover:border-gray-600'
                               }`}
                  >
                    {size} spaces
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
                Word Wrap
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'on', label: 'On' },
                  { value: 'off', label: 'Off' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateEditorSettings({ wordWrap: option.value as 'on' | 'off' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
                               ${editorSettings.wordWrap === option.value
                                 ? 'bg-indigo-600 border-indigo-500 text-white'
                                 : 'dark:bg-gray-900/50 bg-slate-50 dark:border-gray-700/50 border-slate-200 dark:text-gray-400 text-slate-500 hover:border-slate-300 dark:hover:border-gray-600'
                               }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Toggle
                label="Show Minimap"
                description="Display code minimap on the right side"
                checked={editorSettings.minimap}
                onChange={(checked) => updateEditorSettings({ minimap: checked })}
              />
              <Toggle
                label="Format on Save"
                description="Automatically format code when saving"
                checked={editorSettings.formatOnSave}
                onChange={(checked) => updateEditorSettings({ formatOnSave: checked })}
              />
              <Toggle
                label="Auto-save"
                description={`Automatically save changes after ${editorSettings.autoSaveDelay / 1000} seconds of inactivity`}
                checked={editorSettings.autoSave}
                onChange={(checked) => updateEditorSettings({ autoSave: checked })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
                Line Numbers
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'on', label: 'On' },
                  { value: 'off', label: 'Off' },
                  { value: 'relative', label: 'Relative' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateEditorSettings({ lineNumbers: option.value as 'on' | 'off' | 'relative' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
                               ${editorSettings.lineNumbers === option.value
                                 ? 'bg-indigo-600 border-indigo-500 text-white'
                                 : 'dark:bg-gray-900/50 bg-slate-50 dark:border-gray-700/50 border-slate-200 dark:text-gray-400 text-slate-500 hover:border-slate-300 dark:hover:border-gray-600'
                               }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="space-y-5">
            <Toggle
              label="Enable Backups"
              description="Create backup files before saving changes"
              checked={backupSettings.enabled}
              onChange={(checked) => updateBackupSettings({ enabled: checked })}
            />

            <div className={backupSettings.enabled ? '' : 'opacity-50 pointer-events-none'}>
              <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
                Maximum Backups to Keep
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={backupSettings.maxBackups}
                  onChange={(e) => updateBackupSettings({ maxBackups: Number(e.target.value) })}
                  className="flex-1 accent-indigo-500"
                  disabled={!backupSettings.enabled}
                />
                <span className="w-12 text-center dark:text-gray-300 text-slate-700 font-mono text-sm">
                  {backupSettings.maxBackups}
                </span>
              </div>
              <p className="text-xs dark:text-gray-500 text-slate-400 mt-1">
                Older backups will be automatically deleted
              </p>
            </div>
          </div>
        )}

        {activeTab === 'behavior' && (
          <div className="space-y-4">
            <Toggle
              label="Confirm Before Delete"
              description="Show confirmation dialog when deleting config files or tools"
              checked={behaviorSettings.confirmBeforeDelete}
              onChange={(checked) => updateBehaviorSettings({ confirmBeforeDelete: checked })}
            />
            <Toggle
              label="Expand Tools by Default"
              description="Automatically expand tool sections in the sidebar"
              checked={behaviorSettings.expandToolsByDefault}
              onChange={(checked) => updateBehaviorSettings({ expandToolsByDefault: checked })}
            />
            <Toggle
              label="Remember Last Opened File"
              description="Restore the last opened config file on startup"
              checked={behaviorSettings.rememberLastOpenedFile}
              onChange={(checked) => updateBehaviorSettings({ rememberLastOpenedFile: checked })}
            />

            <div className="pt-2 border-t dark:border-gray-700/50 border-slate-200">
              <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-2">
                Reduce Motion
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'off', label: 'Off' },
                  { value: 'on', label: 'On' },
                  { value: 'system', label: 'System' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateBehaviorSettings({ reduceMotion: option.value as 'on' | 'off' | 'system' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
                               ${behaviorSettings.reduceMotion === option.value
                                 ? 'bg-indigo-600 border-indigo-500 text-white'
                                 : 'dark:bg-gray-900/50 bg-slate-50 dark:border-gray-700/50 border-slate-200 dark:text-gray-400 text-slate-500 hover:border-slate-300 dark:hover:border-gray-600'
                               }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs dark:text-gray-500 text-slate-400 mt-1">
                {behaviorSettings.reduceMotion === 'system' 
                  ? 'Follows your system\'s motion preference'
                  : behaviorSettings.reduceMotion === 'on'
                    ? 'Animations and transitions are disabled'
                    : 'Animations and transitions are enabled'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
