import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import {
  McpConfig,
  McpServer,
  McpSourceMode,
  McpToolStatus,
  McpSyncPreview,
  McpSyncResult,
  McpServerConflict,
  McpConfigPreview,
  McpImportResult,
  McpImportMode,
} from '@/types';

interface McpState {
  // Config
  sourceMode: McpSourceMode;
  servers: McpServer[];
  enabledTools: string[];
  
  // Tool statuses
  toolStatuses: McpToolStatus[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Sync preview
  syncPreviews: McpSyncPreview[];
  activeConflicts: McpServerConflict[];
  
  // Actions
  loadConfig: () => Promise<void>;
  setSourceMode: (mode: McpSourceMode) => Promise<void>;
  loadSourceServers: () => Promise<void>;
  loadToolStatuses: () => Promise<void>;
  
  // Server management (app-managed mode)
  addServer: (server: McpServer) => Promise<void>;
  updateServer: (originalName: string, server: McpServer) => Promise<void>;
  removeServer: (serverName: string) => Promise<void>;
  saveServers: (servers: McpServer[]) => Promise<void>;
  
  // Import from file
  importFromFile: (filePath: string) => Promise<McpImportResult>;
  executeImport: (
    selectedServers: McpServer[],
    mode: McpImportMode,
    overwriteMap: Record<string, boolean>
  ) => Promise<void>;
  
  // Tool enablement
  setToolEnabled: (toolId: string, enabled: boolean) => Promise<void>;
  
  // Sync operations
  previewSync: (toolId: string) => Promise<McpSyncPreview>;
  previewSyncAll: () => Promise<McpSyncPreview[]>;
  previewConfigContent: (toolId: string, resolvedConflicts?: McpServer[]) => Promise<McpConfigPreview>;
  syncToTool: (toolId: string, resolvedConflicts?: McpServer[]) => Promise<McpSyncResult>;
  syncToAll: () => Promise<McpSyncResult[]>;
  
  // Conflict resolution
  setActiveConflicts: (conflicts: McpServerConflict[]) => void;
  clearActiveConflicts: () => void;
  
  // Helpers
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useMcpStore = create<McpState>()((set, get) => ({
  // Initial state
  sourceMode: 'claude',
  servers: [],
  enabledTools: [],
  toolStatuses: [],
  isLoading: false,
  error: null,
  syncPreviews: [],
  activeConflicts: [],

  // Load MCP config
  loadConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const config: McpConfig = await invoke('get_mcp_config');
      set({
        sourceMode: config.sourceMode,
        servers: config.servers,
        enabledTools: config.enabledTools,
        isLoading: false,
      });
      // Also load the source servers based on mode
      await get().loadSourceServers();
      await get().loadToolStatuses();
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  // Set source mode
  setSourceMode: async (mode: McpSourceMode) => {
    set({ isLoading: true, error: null });
    try {
      const config: McpConfig = await invoke('set_mcp_source_mode', { mode });
      set({
        sourceMode: config.sourceMode,
        servers: config.servers,
        enabledTools: config.enabledTools,
        isLoading: false,
      });
      await get().loadSourceServers();
      await get().loadToolStatuses();
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  // Load source servers (based on current mode)
  loadSourceServers: async () => {
    try {
      const servers: McpServer[] = await invoke('get_mcp_source_servers');
      set({ servers });
    } catch (err) {
      set({ error: String(err) });
    }
  },

  // Load tool statuses
  loadToolStatuses: async () => {
    try {
      const statuses: McpToolStatus[] = await invoke('get_mcp_tool_statuses');
      set({ toolStatuses: statuses });
    } catch (err) {
      set({ error: String(err) });
    }
  },

  // Add server (app-managed mode)
  addServer: async (server: McpServer) => {
    set({ isLoading: true, error: null });
    try {
      const servers: McpServer[] = await invoke('add_mcp_server', { server });
      set({ servers, isLoading: false });
      await get().loadToolStatuses();
    } catch (err) {
      set({ error: String(err), isLoading: false });
      throw err;
    }
  },

  // Update server
  updateServer: async (originalName: string, server: McpServer) => {
    set({ isLoading: true, error: null });
    try {
      const servers: McpServer[] = await invoke('update_mcp_server', {
        originalName,
        server,
      });
      set({ servers, isLoading: false });
      await get().loadToolStatuses();
    } catch (err) {
      set({ error: String(err), isLoading: false });
      throw err;
    }
  },

  // Remove server
  removeServer: async (serverName: string) => {
    set({ isLoading: true, error: null });
    try {
      const servers: McpServer[] = await invoke('remove_mcp_server', {
        serverName,
      });
      set({ servers, isLoading: false });
      await get().loadToolStatuses();
    } catch (err) {
      set({ error: String(err), isLoading: false });
      throw err;
    }
  },

  // Save all servers
  saveServers: async (servers: McpServer[]) => {
    set({ isLoading: true, error: null });
    try {
      await invoke('save_app_mcp_servers', { servers });
      set({ servers, isLoading: false });
      await get().loadToolStatuses();
    } catch (err) {
      set({ error: String(err), isLoading: false });
      throw err;
    }
  },

  // Import MCP config from file
  importFromFile: async (filePath: string) => {
    set({ isLoading: true, error: null });
    try {
      const result: McpImportResult = await invoke('import_mcp_config_file', { filePath });
      set({ isLoading: false });
      return result;
    } catch (err) {
      set({ error: String(err), isLoading: false });
      throw err;
    }
  },

  // Execute import with selected servers
  executeImport: async (
    selectedServers: McpServer[],
    mode: McpImportMode,
    overwriteMap: Record<string, boolean>
  ) => {
    set({ isLoading: true, error: null });
    try {
      const currentServers = get().servers;
      let newServers: McpServer[];

      if (mode === 'replace') {
        // Replace mode: just use selected servers
        newServers = selectedServers;
      } else {
        // Merge mode: combine with existing, handling overwrites
        const existingNames = new Set(currentServers.map((s) => s.name));
        const toAdd: McpServer[] = [];
        const toOverwrite: McpServer[] = [];

        for (const server of selectedServers) {
          if (existingNames.has(server.name)) {
            // Conflict - check overwrite map
            if (overwriteMap[server.name] !== false) {
              toOverwrite.push(server);
            }
            // If overwriteMap[name] is false, skip (keep existing)
          } else {
            toAdd.push(server);
          }
        }

        // Start with existing servers, replacing any that should be overwritten
        newServers = currentServers.map((existing) => {
          const overwriteWith = toOverwrite.find((s) => s.name === existing.name);
          return overwriteWith || existing;
        });

        // Add new servers
        newServers.push(...toAdd);
      }

      await invoke('save_app_mcp_servers', { servers: newServers });
      set({ servers: newServers, isLoading: false });
      await get().loadToolStatuses();
    } catch (err) {
      set({ error: String(err), isLoading: false });
      throw err;
    }
  },

  // Set tool enabled/disabled
  setToolEnabled: async (toolId: string, enabled: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const config: McpConfig = await invoke('set_tool_mcp_enabled', {
        toolId,
        enabled,
      });
      set({
        enabledTools: config.enabledTools,
        isLoading: false,
      });
      await get().loadToolStatuses();
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  // Preview sync for a single tool
  previewSync: async (toolId: string) => {
    set({ isLoading: true, error: null });
    try {
      const preview: McpSyncPreview = await invoke('preview_mcp_sync', {
        toolId,
      });
      set({ isLoading: false });
      return preview;
    } catch (err) {
      set({ error: String(err), isLoading: false });
      throw err;
    }
  },

  // Preview sync for all enabled tools
  previewSyncAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const previews: McpSyncPreview[] = await invoke('preview_mcp_sync_all');
      set({ syncPreviews: previews, isLoading: false });
      return previews;
    } catch (err) {
      set({ error: String(err), isLoading: false });
      throw err;
    }
  },

  // Preview full config content after sync
  previewConfigContent: async (toolId: string, resolvedConflicts?: McpServer[]) => {
    try {
      const preview: McpConfigPreview = await invoke('preview_mcp_config_content', {
        toolId,
        resolvedConflicts: resolvedConflicts || null,
      });
      return preview;
    } catch (err) {
      set({ error: String(err) });
      throw err;
    }
  },

  // Sync to a single tool
  syncToTool: async (toolId: string, resolvedConflicts?: McpServer[]) => {
    set({ isLoading: true, error: null });
    try {
      const result: McpSyncResult = await invoke('sync_mcp_to_tool', {
        toolId,
        resolvedConflicts: resolvedConflicts || null,
      });
      set({ isLoading: false });
      await get().loadToolStatuses();
      return result;
    } catch (err) {
      set({ error: String(err), isLoading: false });
      throw err;
    }
  },

  // Sync to all enabled tools
  syncToAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const results: McpSyncResult[] = await invoke('sync_mcp_to_all');
      set({ isLoading: false });
      await get().loadToolStatuses();
      return results;
    } catch (err) {
      set({ error: String(err), isLoading: false });
      throw err;
    }
  },

  // Conflict management
  setActiveConflicts: (conflicts: McpServerConflict[]) => {
    set({ activeConflicts: conflicts });
  },

  clearActiveConflicts: () => {
    set({ activeConflicts: [] });
  },

  // Error management
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
