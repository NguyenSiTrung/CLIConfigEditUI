import { useState } from 'react';
import { X, Moon, Sun, Type, Code, Settings2, Shield, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'appearance' | 'editor' | 'backup' | 'behavior';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    theme,
    toggleTheme,
    editorSettings,
    updateEditorSettings,
    backupSettings,
    updateBackupSettings,
    behaviorSettings,
    updateBehaviorSettings,
    resetSettings,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'appearance', label: 'Appearance', icon: <Sun className="w-4 h-4" /> },
    { id: 'editor', label: 'Editor', icon: <Code className="w-4 h-4" /> },
    { id: 'backup', label: 'Backup', icon: <Shield className="w-4 h-4" /> },
    { id: 'behavior', label: 'Behavior', icon: <Settings2 className="w-4 h-4" /> },
  ];

  return (
    <div
      className="fixed inset-0 dark:bg-black/60 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="dark:bg-gray-800 bg-white rounded-xl shadow-2xl w-full max-w-lg border dark:border-gray-700/50 border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700/50 border-slate-200">
          <h2 className="text-lg font-semibold dark:text-white text-slate-800">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg dark:text-gray-400 text-slate-400 dark:hover:text-white hover:text-slate-700 dark:hover:bg-gray-700/50 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b dark:border-gray-700/50 border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors
                         ${activeTab === tab.id
                           ? 'dark:text-blue-400 text-blue-600 border-b-2 border-blue-500 dark:bg-gray-700/30 bg-blue-50/50'
                           : 'dark:text-gray-400 text-slate-500 dark:hover:text-gray-200 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-gray-700/20'
                         }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {activeTab === 'appearance' && (
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-slate-700 mb-3">
                Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { if (theme === 'light') toggleTheme(); }}
                  className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2
                             border transition-all
                             ${theme === 'dark'
                               ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                               : 'dark:bg-gray-900/50 bg-slate-50 dark:border-gray-700/50 border-slate-200 dark:text-gray-400 text-slate-500 dark:hover:text-white hover:text-slate-700 dark:hover:border-gray-600 hover:border-slate-300 hover:bg-slate-100'
                             }`}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>
                <button
                  onClick={() => { if (theme === 'dark') toggleTheme(); }}
                  className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2
                             border transition-all
                             ${theme === 'light'
                               ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                               : 'dark:bg-gray-900/50 bg-slate-50 dark:border-gray-700/50 border-slate-200 dark:text-gray-400 text-slate-500 dark:hover:text-white hover:text-slate-700 dark:hover:border-gray-600 hover:border-slate-300 hover:bg-slate-100'
                             }`}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>
              </div>
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
                    className="flex-1 accent-blue-500"
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
                                   ? 'bg-blue-600 border-blue-500 text-white'
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
                                   ? 'bg-blue-600 border-blue-500 text-white'
                                   : 'dark:bg-gray-900/50 bg-slate-50 dark:border-gray-700/50 border-slate-200 dark:text-gray-400 text-slate-500 hover:border-slate-300 dark:hover:border-gray-600'
                                 }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <ToggleSetting
                  label="Show Minimap"
                  description="Display code minimap on the right side"
                  checked={editorSettings.minimap}
                  onChange={(checked) => updateEditorSettings({ minimap: checked })}
                />
                <ToggleSetting
                  label="Format on Save"
                  description="Automatically format code when saving"
                  checked={editorSettings.formatOnSave}
                  onChange={(checked) => updateEditorSettings({ formatOnSave: checked })}
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
                                   ? 'bg-blue-600 border-blue-500 text-white'
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
              <ToggleSetting
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
                    className="flex-1 accent-blue-500"
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
              <ToggleSetting
                label="Confirm Before Delete"
                description="Show confirmation dialog when deleting config files or tools"
                checked={behaviorSettings.confirmBeforeDelete}
                onChange={(checked) => updateBehaviorSettings({ confirmBeforeDelete: checked })}
              />
              <ToggleSetting
                label="Expand Tools by Default"
                description="Automatically expand tool sections in the sidebar"
                checked={behaviorSettings.expandToolsByDefault}
                onChange={(checked) => updateBehaviorSettings({ expandToolsByDefault: checked })}
              />
              <ToggleSetting
                label="Remember Last Opened File"
                description="Restore the last opened config file on startup"
                checked={behaviorSettings.rememberLastOpenedFile}
                onChange={(checked) => updateBehaviorSettings({ rememberLastOpenedFile: checked })}
              />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t dark:border-gray-700/50 border-slate-200 flex items-center justify-between">
          <button
            onClick={resetSettings}
            className="px-3 py-1.5 text-sm flex items-center gap-1.5 dark:text-gray-400 text-slate-500 
                       dark:hover:text-gray-200 hover:text-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          <p className="text-xs dark:text-gray-500 text-slate-400">
            CLI Config Editor v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}

interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSetting({ label, description, checked, onChange }: ToggleSettingProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium dark:text-gray-300 text-slate-700">{label}</p>
        <p className="text-xs dark:text-gray-500 text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                   transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   ${checked ? 'bg-blue-600' : 'dark:bg-gray-600 bg-slate-300'}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                     transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}
