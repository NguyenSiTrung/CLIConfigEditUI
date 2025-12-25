import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ToolVisibilityState, ToolVisibilityActions } from '@/types';

interface ToolVisibilityStoreState extends ToolVisibilityState {
  showHiddenTools: boolean;
}

interface ToolWithId {
  id: string;
}

interface SortedToolsResult<T extends ToolWithId> {
  pinned: T[];
  visible: T[];
  hidden: T[];
}

interface ToolVisibilityStore extends ToolVisibilityStoreState, ToolVisibilityActions {
  toggleShowHiddenTools: () => void;
  isPinned: (toolId: string) => boolean;
  isHidden: (toolId: string) => boolean;
  getSortedTools: <T extends ToolWithId>(tools: T[]) => SortedToolsResult<T>;
}

export const useToolVisibilityStore = create<ToolVisibilityStore>()(
  persist(
    (set, get) => ({
      pinnedTools: [],
      hiddenTools: [],
      toolOrder: [],
      showHiddenTools: false,

      pinTool: (toolId: string) =>
        set((state) => {
          if (state.pinnedTools.includes(toolId)) return state;
          return {
            pinnedTools: [...state.pinnedTools, toolId],
            hiddenTools: state.hiddenTools.filter((id) => id !== toolId),
          };
        }),

      unpinTool: (toolId: string) =>
        set((state) => ({
          pinnedTools: state.pinnedTools.filter((id) => id !== toolId),
        })),

      togglePinTool: (toolId: string) => {
        const { pinnedTools, pinTool, unpinTool } = get();
        if (pinnedTools.includes(toolId)) {
          unpinTool(toolId);
        } else {
          pinTool(toolId);
        }
      },

      hideTool: (toolId: string) =>
        set((state) => {
          if (state.hiddenTools.includes(toolId)) return state;
          return {
            hiddenTools: [...state.hiddenTools, toolId],
            pinnedTools: state.pinnedTools.filter((id) => id !== toolId),
          };
        }),

      showTool: (toolId: string) =>
        set((state) => ({
          hiddenTools: state.hiddenTools.filter((id) => id !== toolId),
        })),

      toggleHideTool: (toolId: string) => {
        const { hiddenTools, hideTool, showTool } = get();
        if (hiddenTools.includes(toolId)) {
          showTool(toolId);
        } else {
          hideTool(toolId);
        }
      },

      reorderTools: (toolIds: string[]) =>
        set(() => ({
          toolOrder: toolIds,
        })),

      moveToolUp: (toolId: string) =>
        set((state) => {
          const index = state.toolOrder.indexOf(toolId);
          if (index <= 0) return state;
          const newOrder = [...state.toolOrder];
          [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
          return { toolOrder: newOrder };
        }),

      moveToolDown: (toolId: string) =>
        set((state) => {
          const index = state.toolOrder.indexOf(toolId);
          if (index === -1 || index >= state.toolOrder.length - 1) return state;
          const newOrder = [...state.toolOrder];
          [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
          return { toolOrder: newOrder };
        }),

      resetVisibility: () =>
        set(() => ({
          pinnedTools: [],
          hiddenTools: [],
          toolOrder: [],
          showHiddenTools: false,
        })),

      toggleShowHiddenTools: () =>
        set((state) => ({
          showHiddenTools: !state.showHiddenTools,
        })),

      isPinned: (toolId: string) => get().pinnedTools.includes(toolId),

      isHidden: (toolId: string) => get().hiddenTools.includes(toolId),

      getSortedTools: <T extends ToolWithId>(tools: T[]): SortedToolsResult<T> => {
        const { pinnedTools, hiddenTools, toolOrder } = get();
        const pinnedSet = new Set(pinnedTools);
        const hiddenSet = new Set(hiddenTools);

        const pinned: T[] = [];
        const visible: T[] = [];
        const hidden: T[] = [];

        const toolMap = new Map(tools.map((t) => [t.id, t]));

        for (const pinnedId of pinnedTools) {
          const tool = toolMap.get(pinnedId);
          if (tool && !hiddenSet.has(pinnedId)) {
            pinned.push(tool);
          }
        }

        for (const hiddenId of hiddenTools) {
          const tool = toolMap.get(hiddenId);
          if (tool) {
            hidden.push(tool);
          }
        }

        const remainingTools = tools.filter(
          (t) => !pinnedSet.has(t.id) && !hiddenSet.has(t.id)
        );

        if (toolOrder.length > 0) {
          const orderMap = new Map(toolOrder.map((id, idx) => [id, idx]));
          remainingTools.sort((a, b) => {
            const aIdx = orderMap.get(a.id);
            const bIdx = orderMap.get(b.id);
            if (aIdx !== undefined && bIdx !== undefined) return aIdx - bIdx;
            if (aIdx !== undefined) return -1;
            if (bIdx !== undefined) return 1;
            return 0;
          });
        }

        visible.push(...remainingTools);

        return { pinned, visible, hidden };
      },
    }),
    {
      name: 'cli-config-tool-visibility',
      partialize: (state) => ({
        pinnedTools: state.pinnedTools,
        hiddenTools: state.hiddenTools,
        toolOrder: state.toolOrder,
        showHiddenTools: state.showHiddenTools,
      }),
    }
  )
);
