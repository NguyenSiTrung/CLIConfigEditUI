import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CliTool, ConfigFile, ConfigFormat, CustomTool, ToolConfigFiles } from '@/types';
import { CLI_TOOLS } from '@/utils/cli-tools';

interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: 'on' | 'off' | 'wordWrapColumn';
  lineNumbers: 'on' | 'off' | 'relative';
  minimap: boolean;
  formatOnSave: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
}

interface BackupSettings {
  enabled: boolean;
  maxBackups: number;
}

interface BehaviorSettings {
  confirmBeforeDelete: boolean;
  expandToolsByDefault: boolean;
  rememberLastOpenedFile: boolean;
  reduceMotion: 'on' | 'off' | 'system';
}

interface AppState {
  // Tools config - user-managed config files per tool
  toolConfigs: ToolConfigFiles[];
  
  // Legacy custom tools (for backward compatibility)
  customTools: CustomTool[];

  // Editor state
  activeToolId: string | null;
  activeConfigFileId: string | null;
  editorContent: string;
  originalContent: string;
  currentFilePath: string | null;
  currentFormat: ConfigFormat;
  currentJsonPath: string | null;  // For partial JSON editing
  currentJsonPrefix: string | null;  // For prefix-based JSON editing (e.g., "amp")

  // UI state
  searchQuery: string;
  expandedTools: Set<string>;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  isLoading: boolean;
  error: string | null;
  theme: 'dark' | 'light' | 'system';
  resolvedTheme: 'dark' | 'light';

  // Settings
  editorSettings: EditorSettings;
  backupSettings: BackupSettings;
  behaviorSettings: BehaviorSettings;

  // Actions
  setActiveToolId: (id: string | null) => void;
  setActiveConfigFileId: (id: string | null) => void;
  setEditorContent: (content: string) => void;
  setOriginalContent: (content: string) => void;
  setCurrentFilePath: (path: string | null) => void;
  setCurrentFormat: (format: ConfigFormat) => void;
  setCurrentJsonPath: (jsonPath: string | null) => void;
  setCurrentJsonPrefix: (prefix: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fileNotFound: boolean;
  setFileNotFound: (notFound: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setResolvedTheme: (theme: 'dark' | 'light') => void;
  toggleToolExpanded: (toolId: string) => void;
  expandAllTools: () => void;
  collapseAllTools: () => void;

  // Settings actions
  updateEditorSettings: (settings: Partial<EditorSettings>) => void;
  updateBackupSettings: (settings: Partial<BackupSettings>) => void;
  updateBehaviorSettings: (settings: Partial<BehaviorSettings>) => void;
  resetSettings: () => void;

  // Config file management
  addConfigFile: (toolId: string, configFile: Omit<ConfigFile, 'id'>) => void;
  updateConfigFile: (toolId: string, configFileId: string, updates: Partial<ConfigFile>) => void;
  removeConfigFile: (toolId: string, configFileId: string) => void;
  getToolConfigFiles: (toolId: string) => ConfigFile[];

  // Legacy custom tools (keep for backward compatibility)
  addCustomTool: (tool: Omit<CustomTool, 'id'>) => void;
  removeCustomTool: (id: string) => void;
  updateCustomTool: (id: string, updates: Partial<CustomTool>) => void;

  // Computed
  isDirty: () => boolean;
  getAllTools: () => CliTool[];
  getFilteredTools: () => { tools: CliTool[]; custom: CustomTool[] };
  hasConfigFiles: (toolId: string) => boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      toolConfigs: [],
      customTools: [],
      activeToolId: null,
      activeConfigFileId: null,
      editorContent: '',
      originalContent: '',
      currentFilePath: null,
      currentFormat: 'json',
      currentJsonPath: null,
      currentJsonPrefix: null,
      searchQuery: '',
      expandedTools: new Set<string>(),
      sidebarCollapsed: false,
      sidebarWidth: 288,
      isLoading: false,
      error: null,
      fileNotFound: false,
      theme: 'dark',
      resolvedTheme: 'dark',

      // Default settings
      editorSettings: {
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        tabSize: 2,
        wordWrap: 'on',
        lineNumbers: 'on',
        minimap: false,
        formatOnSave: false,
        autoSave: false,
        autoSaveDelay: 2000,
      },
      backupSettings: {
        enabled: true,
        maxBackups: 1,
      },
      behaviorSettings: {
        confirmBeforeDelete: true,
        expandToolsByDefault: false,
        rememberLastOpenedFile: true,
        reduceMotion: 'system',
      },

      // Actions
      setActiveToolId: (id) => set({ activeToolId: id }),
      setActiveConfigFileId: (id) => set({ activeConfigFileId: id }),
      setEditorContent: (content) => set({ editorContent: content }),
      setOriginalContent: (content) => set({ originalContent: content }),
      setCurrentFilePath: (path) => set({ currentFilePath: path }),
      setCurrentFormat: (format) => set({ currentFormat: format }),
      setCurrentJsonPath: (jsonPath) => set({ currentJsonPath: jsonPath }),
      setCurrentJsonPrefix: (prefix) => set({ currentJsonPrefix: prefix }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setFileNotFound: (notFound) => set({ fileNotFound: notFound }),
      toggleTheme: () =>
        set((state) => {
          const themes: Array<'dark' | 'light' | 'system'> = ['dark', 'light', 'system'];
          const currentIndex = themes.indexOf(state.theme);
          const newTheme = themes[(currentIndex + 1) % themes.length];
          if (newTheme !== 'system') {
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
            return { theme: newTheme, resolvedTheme: newTheme };
          }
          return { theme: newTheme };
        }),
      setTheme: (theme) =>
        set(() => {
          if (theme !== 'system') {
            document.documentElement.classList.toggle('dark', theme === 'dark');
            return { theme, resolvedTheme: theme };
          }
          return { theme };
        }),
      setResolvedTheme: (resolvedTheme) =>
        set(() => {
          document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
          return { resolvedTheme };
        }),
      toggleToolExpanded: (toolId) =>
        set((state) => {
          const newExpanded = new Set(state.expandedTools);
          if (newExpanded.has(toolId)) {
            newExpanded.delete(toolId);
          } else {
            newExpanded.add(toolId);
          }
          return { expandedTools: newExpanded };
        }),
      expandAllTools: () =>
        set(() => {
          const allToolIds = CLI_TOOLS.map((t) => t.id);
          const customToolIds = get().customTools.map((t) => t.id);
          return { expandedTools: new Set([...allToolIds, ...customToolIds]) };
        }),
      collapseAllTools: () =>
        set(() => ({ expandedTools: new Set<string>() })),

      // Settings actions
      updateEditorSettings: (settings) =>
        set((state) => ({
          editorSettings: { ...state.editorSettings, ...settings },
        })),
      updateBackupSettings: (settings) =>
        set((state) => ({
          backupSettings: { ...state.backupSettings, ...settings },
        })),
      updateBehaviorSettings: (settings) =>
        set((state) => ({
          behaviorSettings: { ...state.behaviorSettings, ...settings },
        })),
      resetSettings: () =>
        set({
          editorSettings: {
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            tabSize: 2,
            wordWrap: 'on',
            lineNumbers: 'on',
            minimap: false,
            formatOnSave: false,
            autoSave: false,
            autoSaveDelay: 2000,
          },
          backupSettings: {
            enabled: true,
            maxBackups: 1,
          },
          behaviorSettings: {
            confirmBeforeDelete: true,
            expandToolsByDefault: false,
            rememberLastOpenedFile: true,
            reduceMotion: 'system',
          },
        }),

      // Config file management
      addConfigFile: (toolId, configFile) =>
        set((state) => {
          const existing = state.toolConfigs.find((tc) => tc.toolId === toolId);
          const newConfigFile: ConfigFile = {
            ...configFile,
            id: `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };

          if (existing) {
            return {
              toolConfigs: state.toolConfigs.map((tc) =>
                tc.toolId === toolId
                  ? { ...tc, configFiles: [...tc.configFiles, newConfigFile] }
                  : tc
              ),
            };
          } else {
            return {
              toolConfigs: [
                ...state.toolConfigs,
                { toolId, configFiles: [newConfigFile] },
              ],
            };
          }
        }),

      updateConfigFile: (toolId, configFileId, updates) =>
        set((state) => ({
          toolConfigs: state.toolConfigs.map((tc) =>
            tc.toolId === toolId
              ? {
                  ...tc,
                  configFiles: tc.configFiles.map((cf) =>
                    cf.id === configFileId ? { ...cf, ...updates } : cf
                  ),
                }
              : tc
          ),
        })),

      removeConfigFile: (toolId, configFileId) =>
        set((state) => ({
          toolConfigs: state.toolConfigs.map((tc) =>
            tc.toolId === toolId
              ? {
                  ...tc,
                  configFiles: tc.configFiles.filter((cf) => cf.id !== configFileId),
                }
              : tc
          ),
        })),

      getToolConfigFiles: (toolId) => {
        const toolConfig = get().toolConfigs.find((tc) => tc.toolId === toolId);
        return toolConfig?.configFiles || [];
      },

      // Legacy custom tools
      addCustomTool: (tool) =>
        set((state) => ({
          customTools: [
            ...state.customTools,
            { ...tool, id: `custom-${Date.now()}` },
          ],
        })),

      removeCustomTool: (id) =>
        set((state) => ({
          customTools: state.customTools.filter((t) => t.id !== id),
        })),

      updateCustomTool: (id, updates) =>
        set((state) => ({
          customTools: state.customTools.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      // Computed
      isDirty: () => get().editorContent !== get().originalContent,

      getAllTools: () => CLI_TOOLS,

      getFilteredTools: () => {
        const { customTools, searchQuery } = get();
        const query = searchQuery.toLowerCase();

        const tools = CLI_TOOLS.filter((t) =>
          t.name.toLowerCase().includes(query)
        );

        const custom = customTools.filter((t) =>
          t.name.toLowerCase().includes(query)
        );

        return { tools, custom };
      },

      hasConfigFiles: (toolId) => {
        const toolConfig = get().toolConfigs.find((tc) => tc.toolId === toolId);
        return (toolConfig?.configFiles.length || 0) > 0;
      },
    }),
    {
      name: 'cli-config-editor',
      partialize: (state) => ({
        toolConfigs: state.toolConfigs,
        customTools: state.customTools,
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarWidth: state.sidebarWidth,
        theme: state.theme,
        expandedTools: Array.from(state.expandedTools),
        editorSettings: state.editorSettings,
        backupSettings: state.backupSettings,
        behaviorSettings: state.behaviorSettings,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<AppState> & { expandedTools?: string[] };
        return {
          ...current,
          ...persistedState,
          expandedTools: new Set(persistedState.expandedTools || []),
        };
      },
    }
  )
);
