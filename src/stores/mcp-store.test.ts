import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mockInvokeSuccess, mockInvokeOnce, resetMocks } from '@/test/tauri-mocks';
import { useMcpStore } from './mcp-store';
import type {
  McpConfig,
  McpServer,
  McpToolStatus,
  McpSyncPreview,
  McpSyncResult,
  McpServerConflict,
  McpConfigPreview,
  McpImportResult,
} from '@/types';

const createMockServer = (name: string): McpServer => ({
  name,
  command: 'node',
  args: ['server.js'],
  env: { NODE_ENV: 'test' },
});

const createMockToolStatus = (toolId: string, overrides?: Partial<McpToolStatus>): McpToolStatus => ({
  toolId,
  name: toolId.charAt(0).toUpperCase() + toolId.slice(1),
  installed: true,
  configPath: `/path/to/${toolId}/config.json`,
  syncStatus: 'synced',
  serverCount: 2,
  enabled: true,
  ...overrides,
});

const createMockConfig = (overrides?: Partial<McpConfig>): McpConfig => ({
  sourceMode: 'claude',
  servers: [],
  enabledTools: [],
  ...overrides,
});

describe('mcp-store', () => {
  beforeEach(() => {
    resetMocks();
    useMcpStore.setState({
      sourceMode: 'claude',
      servers: [],
      enabledTools: [],
      toolStatuses: [],
      isLoading: false,
      error: null,
      syncPreviews: [],
      activeConflicts: [],
    });
  });

  afterEach(() => {
    resetMocks();
  });

  describe('Initial state', () => {
    it('should have correct default values', () => {
      const state = useMcpStore.getState();
      expect(state.sourceMode).toBe('claude');
      expect(state.servers).toEqual([]);
      expect(state.enabledTools).toEqual([]);
      expect(state.toolStatuses).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.syncPreviews).toEqual([]);
      expect(state.activeConflicts).toEqual([]);
    });
  });

  describe('State management (sync actions)', () => {
    describe('setActiveConflicts', () => {
      it('should set active conflicts', () => {
        const conflicts: McpServerConflict[] = [
          {
            serverName: 'test-server',
            sourceServer: createMockServer('test-server'),
            targetServer: { ...createMockServer('test-server'), command: 'python' },
            toolId: 'claude',
          },
        ];

        useMcpStore.getState().setActiveConflicts(conflicts);
        expect(useMcpStore.getState().activeConflicts).toEqual(conflicts);
      });
    });

    describe('clearActiveConflicts', () => {
      it('should clear active conflicts', () => {
        const conflicts: McpServerConflict[] = [
          {
            serverName: 'test-server',
            sourceServer: createMockServer('test-server'),
            targetServer: createMockServer('test-server'),
            toolId: 'claude',
          },
        ];
        useMcpStore.setState({ activeConflicts: conflicts });

        useMcpStore.getState().clearActiveConflicts();
        expect(useMcpStore.getState().activeConflicts).toEqual([]);
      });
    });

    describe('setError', () => {
      it('should set error message', () => {
        useMcpStore.getState().setError('Test error message');
        expect(useMcpStore.getState().error).toBe('Test error message');
      });

      it('should allow setting error to null', () => {
        useMcpStore.setState({ error: 'existing error' });
        useMcpStore.getState().setError(null);
        expect(useMcpStore.getState().error).toBeNull();
      });
    });

    describe('clearError', () => {
      it('should clear error', () => {
        useMcpStore.setState({ error: 'existing error' });
        useMcpStore.getState().clearError();
        expect(useMcpStore.getState().error).toBeNull();
      });
    });
  });

  describe('Config loading (async with mocked Tauri)', () => {
    describe('loadConfig', () => {
      it('should load config successfully', async () => {
        const mockServers = [createMockServer('server1')];
        const mockStatuses = [createMockToolStatus('claude')];

        mockInvokeSuccess({
          get_mcp_config: createMockConfig({
            sourceMode: 'app-managed',
            servers: mockServers,
            enabledTools: ['claude'],
          }),
          get_mcp_source_servers: mockServers,
          get_mcp_tool_statuses: mockStatuses,
        });

        await useMcpStore.getState().loadConfig();

        const state = useMcpStore.getState();
        expect(state.sourceMode).toBe('app-managed');
        expect(state.servers).toEqual(mockServers);
        expect(state.enabledTools).toEqual(['claude']);
        expect(state.toolStatuses).toEqual(mockStatuses);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
      });

      it('should handle error when loading config', async () => {
        mockInvokeSuccess({
          get_mcp_config: () => {
            throw new Error('Failed to load config');
          },
        });

        await useMcpStore.getState().loadConfig();

        const state = useMcpStore.getState();
        expect(state.error).toBe('Error: Failed to load config');
        expect(state.isLoading).toBe(false);
      });
    });

    describe('setSourceMode', () => {
      it('should set source mode successfully', async () => {
        const mockServers = [createMockServer('server1')];
        const mockStatuses = [createMockToolStatus('claude')];

        mockInvokeSuccess({
          set_mcp_source_mode: createMockConfig({
            sourceMode: 'app-managed',
            servers: mockServers,
            enabledTools: ['claude'],
          }),
          get_mcp_source_servers: mockServers,
          get_mcp_tool_statuses: mockStatuses,
        });

        await useMcpStore.getState().setSourceMode('app-managed');

        const state = useMcpStore.getState();
        expect(state.sourceMode).toBe('app-managed');
        expect(state.servers).toEqual(mockServers);
        expect(state.isLoading).toBe(false);
      });

      it('should handle error when setting source mode', async () => {
        mockInvokeSuccess({
          set_mcp_source_mode: () => {
            throw new Error('Failed to set mode');
          },
        });

        await useMcpStore.getState().setSourceMode('app-managed');

        expect(useMcpStore.getState().error).toBe('Error: Failed to set mode');
        expect(useMcpStore.getState().isLoading).toBe(false);
      });
    });

    describe('loadSourceServers', () => {
      it('should load source servers successfully', async () => {
        const mockServers = [createMockServer('server1'), createMockServer('server2')];

        mockInvokeSuccess({
          get_mcp_source_servers: mockServers,
        });

        await useMcpStore.getState().loadSourceServers();

        expect(useMcpStore.getState().servers).toEqual(mockServers);
      });

      it('should handle error when loading source servers', async () => {
        mockInvokeSuccess({
          get_mcp_source_servers: () => {
            throw new Error('Failed to load servers');
          },
        });

        await useMcpStore.getState().loadSourceServers();

        expect(useMcpStore.getState().error).toBe('Error: Failed to load servers');
      });
    });

    describe('loadToolStatuses', () => {
      it('should load tool statuses successfully', async () => {
        const mockStatuses = [
          createMockToolStatus('claude'),
          createMockToolStatus('cursor', { syncStatus: 'out-of-sync' }),
        ];

        mockInvokeSuccess({
          get_mcp_tool_statuses: mockStatuses,
        });

        await useMcpStore.getState().loadToolStatuses();

        expect(useMcpStore.getState().toolStatuses).toEqual(mockStatuses);
      });

      it('should handle error when loading tool statuses', async () => {
        mockInvokeSuccess({
          get_mcp_tool_statuses: () => {
            throw new Error('Failed to load statuses');
          },
        });

        await useMcpStore.getState().loadToolStatuses();

        expect(useMcpStore.getState().error).toBe('Error: Failed to load statuses');
      });
    });
  });

  describe('Server CRUD (async)', () => {
    describe('addServer', () => {
      it('should add server successfully', async () => {
        const newServer = createMockServer('new-server');
        const updatedServers = [newServer];
        const mockStatuses = [createMockToolStatus('claude')];

        mockInvokeSuccess({
          add_mcp_server: updatedServers,
          get_mcp_tool_statuses: mockStatuses,
        });

        await useMcpStore.getState().addServer(newServer);

        const state = useMcpStore.getState();
        expect(state.servers).toEqual(updatedServers);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
      });

      it('should handle error when adding server', async () => {
        const newServer = createMockServer('new-server');

        mockInvokeSuccess({
          add_mcp_server: () => {
            throw new Error('Server already exists');
          },
        });

        await expect(useMcpStore.getState().addServer(newServer)).rejects.toThrow('Server already exists');
        expect(useMcpStore.getState().error).toBe('Error: Server already exists');
        expect(useMcpStore.getState().isLoading).toBe(false);
      });
    });

    describe('updateServer', () => {
      it('should update server successfully', async () => {
        const updatedServer = { ...createMockServer('server1'), command: 'python' };
        const updatedServers = [updatedServer];
        const mockStatuses = [createMockToolStatus('claude')];

        mockInvokeSuccess({
          update_mcp_server: updatedServers,
          get_mcp_tool_statuses: mockStatuses,
        });

        await useMcpStore.getState().updateServer('server1', updatedServer);

        expect(useMcpStore.getState().servers).toEqual(updatedServers);
        expect(useMcpStore.getState().isLoading).toBe(false);
      });

      it('should handle error when updating server', async () => {
        const updatedServer = createMockServer('server1');

        mockInvokeSuccess({
          update_mcp_server: () => {
            throw new Error('Server not found');
          },
        });

        await expect(useMcpStore.getState().updateServer('server1', updatedServer)).rejects.toThrow('Server not found');
        expect(useMcpStore.getState().error).toBe('Error: Server not found');
      });
    });

    describe('removeServer', () => {
      it('should remove server successfully', async () => {
        useMcpStore.setState({ servers: [createMockServer('server1')] });
        const mockStatuses = [createMockToolStatus('claude')];

        mockInvokeSuccess({
          remove_mcp_server: [],
          get_mcp_tool_statuses: mockStatuses,
        });

        await useMcpStore.getState().removeServer('server1');

        expect(useMcpStore.getState().servers).toEqual([]);
        expect(useMcpStore.getState().isLoading).toBe(false);
      });

      it('should handle error when removing server', async () => {
        mockInvokeSuccess({
          remove_mcp_server: () => {
            throw new Error('Server not found');
          },
        });

        await expect(useMcpStore.getState().removeServer('server1')).rejects.toThrow('Server not found');
        expect(useMcpStore.getState().error).toBe('Error: Server not found');
      });
    });

    describe('saveServers', () => {
      it('should save servers successfully', async () => {
        const servers = [createMockServer('server1'), createMockServer('server2')];
        const mockStatuses = [createMockToolStatus('claude')];

        mockInvokeSuccess({
          save_app_mcp_servers: undefined,
          get_mcp_tool_statuses: mockStatuses,
        });

        await useMcpStore.getState().saveServers(servers);

        expect(useMcpStore.getState().servers).toEqual(servers);
        expect(useMcpStore.getState().isLoading).toBe(false);
      });

      it('should handle error when saving servers', async () => {
        const servers = [createMockServer('server1')];

        mockInvokeSuccess({
          save_app_mcp_servers: () => {
            throw new Error('Failed to save');
          },
        });

        await expect(useMcpStore.getState().saveServers(servers)).rejects.toThrow('Failed to save');
        expect(useMcpStore.getState().error).toBe('Error: Failed to save');
      });
    });
  });

  describe('Import operations (async)', () => {
    describe('importFromFile', () => {
      it('should import from file successfully', async () => {
        const importResult: McpImportResult = {
          servers: [createMockServer('imported-server')],
          sourcePath: '/path/to/config.json',
          detectedFormat: 'standard',
        };

        mockInvokeSuccess({
          import_mcp_config_file: importResult,
        });

        const result = await useMcpStore.getState().importFromFile('/path/to/config.json');

        expect(result).toEqual(importResult);
        expect(useMcpStore.getState().isLoading).toBe(false);
      });

      it('should handle error when importing from file', async () => {
        mockInvokeSuccess({
          import_mcp_config_file: () => {
            throw new Error('Invalid file format');
          },
        });

        await expect(useMcpStore.getState().importFromFile('/invalid/path')).rejects.toThrow('Invalid file format');
        expect(useMcpStore.getState().error).toBe('Error: Invalid file format');
      });
    });

    describe('executeImport with replace mode', () => {
      it('should replace all servers with selected servers', async () => {
        const existingServers = [createMockServer('existing1'), createMockServer('existing2')];
        const selectedServers = [createMockServer('new1'), createMockServer('new2')];
        const mockStatuses = [createMockToolStatus('claude')];

        useMcpStore.setState({ servers: existingServers });

        mockInvokeSuccess({
          save_app_mcp_servers: undefined,
          get_mcp_tool_statuses: mockStatuses,
        });

        await useMcpStore.getState().executeImport(selectedServers, 'replace', {});

        expect(useMcpStore.getState().servers).toEqual(selectedServers);
      });
    });

    describe('executeImport with merge mode', () => {
      it('should merge servers with existing ones', async () => {
        const existingServers = [createMockServer('existing1')];
        const selectedServers = [createMockServer('new1')];
        const mockStatuses = [createMockToolStatus('claude')];

        useMcpStore.setState({ servers: existingServers });

        mockInvokeSuccess({
          save_app_mcp_servers: undefined,
          get_mcp_tool_statuses: mockStatuses,
        });

        await useMcpStore.getState().executeImport(selectedServers, 'merge', {});

        const state = useMcpStore.getState();
        expect(state.servers).toHaveLength(2);
        expect(state.servers.map((s) => s.name)).toContain('existing1');
        expect(state.servers.map((s) => s.name)).toContain('new1');
      });

      it('should handle overwrite conflicts in merge mode', async () => {
        const existingServer = createMockServer('conflicting');
        const newServer = { ...createMockServer('conflicting'), command: 'python' };
        const mockStatuses = [createMockToolStatus('claude')];

        useMcpStore.setState({ servers: [existingServer] });

        mockInvokeSuccess({
          save_app_mcp_servers: undefined,
          get_mcp_tool_statuses: mockStatuses,
        });

        await useMcpStore.getState().executeImport([newServer], 'merge', { conflicting: true });

        const state = useMcpStore.getState();
        expect(state.servers).toHaveLength(1);
        expect(state.servers[0].command).toBe('python');
      });

      it('should keep existing server when overwrite is false', async () => {
        const existingServer = createMockServer('conflicting');
        const newServer = { ...createMockServer('conflicting'), command: 'python' };
        const mockStatuses = [createMockToolStatus('claude')];

        useMcpStore.setState({ servers: [existingServer] });

        mockInvokeSuccess({
          save_app_mcp_servers: undefined,
          get_mcp_tool_statuses: mockStatuses,
        });

        await useMcpStore.getState().executeImport([newServer], 'merge', { conflicting: false });

        const state = useMcpStore.getState();
        expect(state.servers).toHaveLength(1);
        expect(state.servers[0].command).toBe('node');
      });
    });
  });

  describe('Sync operations (async)', () => {
    describe('setToolEnabled', () => {
      it('should enable tool successfully', async () => {
        const mockConfig = createMockConfig({ enabledTools: ['claude', 'cursor'] });
        const mockStatuses = [createMockToolStatus('claude'), createMockToolStatus('cursor')];

        mockInvokeSuccess({
          set_tool_mcp_enabled: mockConfig,
          get_mcp_tool_statuses: mockStatuses,
        });

        await useMcpStore.getState().setToolEnabled('cursor', true);

        expect(useMcpStore.getState().enabledTools).toEqual(['claude', 'cursor']);
        expect(useMcpStore.getState().isLoading).toBe(false);
      });

      it('should handle error when setting tool enabled', async () => {
        mockInvokeSuccess({
          set_tool_mcp_enabled: () => {
            throw new Error('Failed to enable tool');
          },
        });

        await useMcpStore.getState().setToolEnabled('cursor', true);

        expect(useMcpStore.getState().error).toBe('Error: Failed to enable tool');
      });
    });

    describe('previewSync', () => {
      it('should preview sync for single tool successfully', async () => {
        const preview: McpSyncPreview = {
          toolId: 'claude',
          toolName: 'Claude',
          mergeResult: {
            toolId: 'claude',
            added: [createMockServer('new-server')],
            kept: [],
            conflicts: [],
          },
          hasChanges: true,
        };

        mockInvokeSuccess({
          preview_mcp_sync: preview,
        });

        const result = await useMcpStore.getState().previewSync('claude');

        expect(result).toEqual(preview);
        expect(useMcpStore.getState().isLoading).toBe(false);
      });

      it('should handle error when previewing sync', async () => {
        mockInvokeSuccess({
          preview_mcp_sync: () => {
            throw new Error('Failed to preview');
          },
        });

        await expect(useMcpStore.getState().previewSync('claude')).rejects.toThrow('Failed to preview');
        expect(useMcpStore.getState().error).toBe('Error: Failed to preview');
      });
    });

    describe('previewSyncAll', () => {
      it('should preview sync for all tools successfully', async () => {
        const previews: McpSyncPreview[] = [
          {
            toolId: 'claude',
            toolName: 'Claude',
            mergeResult: { toolId: 'claude', added: [], kept: [], conflicts: [] },
            hasChanges: false,
          },
          {
            toolId: 'cursor',
            toolName: 'Cursor',
            mergeResult: { toolId: 'cursor', added: [createMockServer('new')], kept: [], conflicts: [] },
            hasChanges: true,
          },
        ];

        mockInvokeSuccess({
          preview_mcp_sync_all: previews,
        });

        const result = await useMcpStore.getState().previewSyncAll();

        expect(result).toEqual(previews);
        expect(useMcpStore.getState().syncPreviews).toEqual(previews);
        expect(useMcpStore.getState().isLoading).toBe(false);
      });

      it('should handle error when previewing sync all', async () => {
        mockInvokeSuccess({
          preview_mcp_sync_all: () => {
            throw new Error('Failed to preview all');
          },
        });

        await expect(useMcpStore.getState().previewSyncAll()).rejects.toThrow('Failed to preview all');
        expect(useMcpStore.getState().error).toBe('Error: Failed to preview all');
      });
    });

    describe('previewConfigContent', () => {
      it('should preview config content successfully', async () => {
        const preview: McpConfigPreview = {
          toolId: 'claude',
          toolName: 'Claude',
          configPath: '/path/to/claude/config.json',
          currentContent: '{}',
          previewContent: '{"mcpServers":{}}',
        };

        mockInvokeSuccess({
          preview_mcp_config_content: preview,
        });

        const result = await useMcpStore.getState().previewConfigContent('claude');

        expect(result).toEqual(preview);
      });

      it('should preview config content with resolved conflicts', async () => {
        const resolvedConflicts = [createMockServer('resolved-server')];
        const preview: McpConfigPreview = {
          toolId: 'claude',
          toolName: 'Claude',
          configPath: '/path/to/claude/config.json',
          currentContent: '{}',
          previewContent: '{"mcpServers":{"resolved-server":{}}}',
        };

        mockInvokeSuccess({
          preview_mcp_config_content: preview,
        });

        const result = await useMcpStore.getState().previewConfigContent('claude', resolvedConflicts);

        expect(result).toEqual(preview);
      });

      it('should handle error when previewing config content', async () => {
        mockInvokeSuccess({
          preview_mcp_config_content: () => {
            throw new Error('Failed to preview content');
          },
        });

        await expect(useMcpStore.getState().previewConfigContent('claude')).rejects.toThrow('Failed to preview content');
        expect(useMcpStore.getState().error).toBe('Error: Failed to preview content');
      });
    });

    describe('syncToTool', () => {
      it('should sync to tool successfully', async () => {
        const syncResult: McpSyncResult = {
          toolId: 'claude',
          success: true,
          message: 'Synced successfully',
          serversWritten: 3,
        };
        const mockStatuses = [createMockToolStatus('claude', { syncStatus: 'synced' })];

        mockInvokeSuccess({
          sync_mcp_to_tool: syncResult,
          get_mcp_tool_statuses: mockStatuses,
        });

        const result = await useMcpStore.getState().syncToTool('claude');

        expect(result).toEqual(syncResult);
        expect(useMcpStore.getState().isLoading).toBe(false);
      });

      it('should sync to tool with resolved conflicts', async () => {
        const resolvedConflicts = [createMockServer('resolved-server')];
        const syncResult: McpSyncResult = {
          toolId: 'claude',
          success: true,
          message: 'Synced with resolved conflicts',
          serversWritten: 1,
        };
        const mockStatuses = [createMockToolStatus('claude')];

        mockInvokeSuccess({
          sync_mcp_to_tool: syncResult,
          get_mcp_tool_statuses: mockStatuses,
        });

        const result = await useMcpStore.getState().syncToTool('claude', resolvedConflicts);

        expect(result).toEqual(syncResult);
      });

      it('should handle error when syncing to tool', async () => {
        mockInvokeSuccess({
          sync_mcp_to_tool: () => {
            throw new Error('Sync failed');
          },
        });

        await expect(useMcpStore.getState().syncToTool('claude')).rejects.toThrow('Sync failed');
        expect(useMcpStore.getState().error).toBe('Error: Sync failed');
      });
    });

    describe('syncToAll', () => {
      it('should sync to all tools successfully', async () => {
        const syncResults: McpSyncResult[] = [
          { toolId: 'claude', success: true, message: 'Synced', serversWritten: 2 },
          { toolId: 'cursor', success: true, message: 'Synced', serversWritten: 2 },
        ];
        const mockStatuses = [
          createMockToolStatus('claude', { syncStatus: 'synced' }),
          createMockToolStatus('cursor', { syncStatus: 'synced' }),
        ];

        mockInvokeSuccess({
          sync_mcp_to_all: syncResults,
          get_mcp_tool_statuses: mockStatuses,
        });

        const results = await useMcpStore.getState().syncToAll();

        expect(results).toEqual(syncResults);
        expect(useMcpStore.getState().isLoading).toBe(false);
      });

      it('should handle error when syncing to all tools', async () => {
        mockInvokeSuccess({
          sync_mcp_to_all: () => {
            throw new Error('Sync all failed');
          },
        });

        await expect(useMcpStore.getState().syncToAll()).rejects.toThrow('Sync all failed');
        expect(useMcpStore.getState().error).toBe('Error: Sync all failed');
      });
    });
  });
});
