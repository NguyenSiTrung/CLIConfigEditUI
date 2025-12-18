import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CliTool, CustomTool, ConfigFormat } from '@/types';
import { CLI_TOOLS } from '@/utils/cli-tools';

interface AppState {
  // Tools
  installedTools: CliTool[];
  customTools: CustomTool[];

  // Editor state
  activeToolId: string | null;
  editorContent: string;
  originalContent: string;
  currentFilePath: string | null;
  currentFormat: ConfigFormat;

  // UI state
  searchQuery: string;
  sidebarCollapsed: boolean;
  isLoading: boolean;
  error: string | null;
  theme: 'dark' | 'light';

  // Actions
  setActiveToolId: (id: string | null) => void;
  setEditorContent: (content: string) => void;
  setOriginalContent: (content: string) => void;
  setCurrentFilePath: (path: string | null) => void;
  setCurrentFormat: (format: ConfigFormat) => void;
  setSearchQuery: (query: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setInstalledTools: (tools: CliTool[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleTheme: () => void;

  // Custom tools
  addCustomTool: (tool: Omit<CustomTool, 'id'>) => void;
  removeCustomTool: (id: string) => void;
  updateCustomTool: (id: string, updates: Partial<CustomTool>) => void;

  // Computed
  isDirty: () => boolean;
  getAllTools: () => CliTool[];
  getFilteredTools: () => { installed: CliTool[]; available: CliTool[]; custom: CustomTool[] };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      installedTools: [],
      customTools: [],
      activeToolId: null,
      editorContent: '',
      originalContent: '',
      currentFilePath: null,
      currentFormat: 'json',
      searchQuery: '',
      sidebarCollapsed: false,
      isLoading: false,
      error: null,
      theme: 'dark',

      // Actions
      setActiveToolId: (id) => set({ activeToolId: id }),
      setEditorContent: (content) => set({ editorContent: content }),
      setOriginalContent: (content) => set({ originalContent: content }),
      setCurrentFilePath: (path) => set({ currentFilePath: path }),
      setCurrentFormat: (format) => set({ currentFormat: format }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setInstalledTools: (tools) => set({ installedTools: tools }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
          return { theme: newTheme };
        }),

      // Custom tools
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
        const { installedTools, customTools, searchQuery } = get();
        const query = searchQuery.toLowerCase();

        const installed = installedTools.filter((t) =>
          t.name.toLowerCase().includes(query)
        );

        const installedIds = new Set(installedTools.map((t) => t.id));
        const available = CLI_TOOLS.filter(
          (t) =>
            !installedIds.has(t.id) && t.name.toLowerCase().includes(query)
        );

        const custom = customTools.filter((t) =>
          t.name.toLowerCase().includes(query)
        );

        return { installed, available, custom };
      },
    }),
    {
      name: 'cli-config-editor',
      partialize: (state) => ({
        customTools: state.customTools,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);
