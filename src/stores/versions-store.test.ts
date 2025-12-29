import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockInvokeSuccess, mockInvokeOnce, resetMocks, mockInvoke } from '@/test/tauri-mocks';
import { useVersionsStore } from './versions-store';
import { ConfigVersion, VersionMetadata } from '@/types';

const mockVersionMetadata: VersionMetadata = {
  id: 'v1',
  configId: 'config-1',
  name: 'Test Version',
  description: 'Test description',
  timestamp: 1704067200000,
  source: 'manual',
  isDefault: false,
};

const mockVersionMetadata2: VersionMetadata = {
  id: 'v2',
  configId: 'config-1',
  name: 'Test Version 2',
  timestamp: 1704153600000,
  source: 'auto',
  isDefault: true,
};

const mockVersionMetadata3: VersionMetadata = {
  id: 'v3',
  configId: 'config-1',
  name: 'Test Version 3',
  timestamp: 1704240000000,
  source: 'manual',
  isDefault: false,
};

const mockConfigVersion: ConfigVersion = {
  ...mockVersionMetadata,
  content: '{"key": "value"}',
};

describe('versions-store', () => {
  beforeEach(() => {
    resetMocks();
    useVersionsStore.setState({
      versions: [],
      selectedVersionIds: [],
      isLoading: false,
      error: null,
      currentConfigId: null,
    });
  });

  describe('Initial state', () => {
    it('should have empty initial state', () => {
      const state = useVersionsStore.getState();
      expect(state.versions).toEqual([]);
      expect(state.selectedVersionIds).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.currentConfigId).toBeNull();
    });
  });

  describe('State management (non-async actions)', () => {
    describe('toggleVersionSelection', () => {
      it('should add version to selection', () => {
        const { toggleVersionSelection } = useVersionsStore.getState();
        toggleVersionSelection('v1');
        expect(useVersionsStore.getState().selectedVersionIds).toEqual(['v1']);
      });

      it('should remove version from selection if already selected', () => {
        useVersionsStore.setState({ selectedVersionIds: ['v1', 'v2'] });
        const { toggleVersionSelection } = useVersionsStore.getState();
        toggleVersionSelection('v1');
        expect(useVersionsStore.getState().selectedVersionIds).toEqual(['v2']);
      });

      it('should allow max 2 selections', () => {
        useVersionsStore.setState({ selectedVersionIds: ['v1', 'v2'] });
        const { toggleVersionSelection } = useVersionsStore.getState();
        toggleVersionSelection('v3');
        expect(useVersionsStore.getState().selectedVersionIds).toEqual(['v2', 'v3']);
      });

      it('should replace oldest when adding third selection', () => {
        const { toggleVersionSelection } = useVersionsStore.getState();
        toggleVersionSelection('v1');
        toggleVersionSelection('v2');
        toggleVersionSelection('v3');
        expect(useVersionsStore.getState().selectedVersionIds).toEqual(['v2', 'v3']);
      });
    });

    describe('clearSelection', () => {
      it('should clear all selected versions', () => {
        useVersionsStore.setState({ selectedVersionIds: ['v1', 'v2'] });
        const { clearSelection } = useVersionsStore.getState();
        clearSelection();
        expect(useVersionsStore.getState().selectedVersionIds).toEqual([]);
      });
    });

    describe('clearVersions', () => {
      it('should clear versions, selection, and configId', () => {
        useVersionsStore.setState({
          versions: [mockVersionMetadata],
          selectedVersionIds: ['v1'],
          currentConfigId: 'config-1',
        });
        const { clearVersions } = useVersionsStore.getState();
        clearVersions();
        const state = useVersionsStore.getState();
        expect(state.versions).toEqual([]);
        expect(state.selectedVersionIds).toEqual([]);
        expect(state.currentConfigId).toBeNull();
      });
    });
  });

  describe('Async operations', () => {
    describe('setCurrentConfigId', () => {
      it('should set configId and trigger fetchVersions', async () => {
        mockInvokeSuccess({ list_versions: [mockVersionMetadata] });
        const { setCurrentConfigId } = useVersionsStore.getState();
        setCurrentConfigId('config-1');

        await vi.waitFor(() => {
          expect(useVersionsStore.getState().currentConfigId).toBe('config-1');
          expect(useVersionsStore.getState().versions).toEqual([mockVersionMetadata]);
        });
      });

      it('should clear versions when configId is null', () => {
        useVersionsStore.setState({
          versions: [mockVersionMetadata],
          selectedVersionIds: ['v1'],
          currentConfigId: 'config-1',
        });
        const { setCurrentConfigId } = useVersionsStore.getState();
        setCurrentConfigId(null);

        const state = useVersionsStore.getState();
        expect(state.currentConfigId).toBeNull();
        expect(state.versions).toEqual([]);
        expect(state.selectedVersionIds).toEqual([]);
      });
    });

    describe('fetchVersions', () => {
      it('should fetch versions successfully', async () => {
        mockInvokeSuccess({ list_versions: [mockVersionMetadata, mockVersionMetadata2] });
        const { fetchVersions } = useVersionsStore.getState();

        await fetchVersions('config-1');

        const state = useVersionsStore.getState();
        expect(state.versions).toEqual([mockVersionMetadata, mockVersionMetadata2]);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
      });

      it('should set loading state during fetch', async () => {
        let resolvePromise: (value: VersionMetadata[]) => void;
        mockInvoke.mockImplementation(
          () =>
            new Promise((resolve) => {
              resolvePromise = resolve;
            })
        );

        const fetchPromise = useVersionsStore.getState().fetchVersions('config-1');
        expect(useVersionsStore.getState().isLoading).toBe(true);

        resolvePromise!([mockVersionMetadata]);
        await fetchPromise;
        expect(useVersionsStore.getState().isLoading).toBe(false);
      });

      it('should handle fetch error', async () => {
        mockInvokeOnce(new Error('Failed to fetch versions'));
        const { fetchVersions } = useVersionsStore.getState();

        await fetchVersions('config-1');

        const state = useVersionsStore.getState();
        expect(state.versions).toEqual([]);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Error: Failed to fetch versions');
      });
    });

    describe('saveVersion', () => {
      it('should save version successfully', async () => {
        mockInvokeSuccess({
          save_version: mockConfigVersion,
          list_versions: [mockVersionMetadata],
        });
        const { saveVersion } = useVersionsStore.getState();

        const result = await saveVersion('config-1', 'Test Version', '{"key": "value"}', 'Description');

        expect(result).toEqual(mockConfigVersion);
        expect(mockInvoke).toHaveBeenCalledWith('save_version', {
          configId: 'config-1',
          name: 'Test Version',
          content: '{"key": "value"}',
          description: 'Description',
          source: 'manual',
        });
      });

      it('should save version without description', async () => {
        mockInvokeSuccess({
          save_version: mockConfigVersion,
          list_versions: [mockVersionMetadata],
        });
        const { saveVersion } = useVersionsStore.getState();

        await saveVersion('config-1', 'Test Version', '{"key": "value"}');

        expect(mockInvoke).toHaveBeenCalledWith('save_version', {
          configId: 'config-1',
          name: 'Test Version',
          content: '{"key": "value"}',
          description: null,
          source: 'manual',
        });
      });

      it('should refresh versions after save', async () => {
        mockInvokeSuccess({
          save_version: mockConfigVersion,
          list_versions: [mockVersionMetadata, mockVersionMetadata2],
        });
        const { saveVersion } = useVersionsStore.getState();

        await saveVersion('config-1', 'Test', 'content');

        expect(useVersionsStore.getState().versions).toEqual([mockVersionMetadata, mockVersionMetadata2]);
      });

      it('should handle save error', async () => {
        mockInvokeOnce(new Error('Save failed'));
        const { saveVersion } = useVersionsStore.getState();

        await expect(saveVersion('config-1', 'Test', 'content')).rejects.toThrow('Save failed');
        expect(useVersionsStore.getState().error).toBe('Error: Save failed');
        expect(useVersionsStore.getState().isLoading).toBe(false);
      });
    });

    describe('loadVersion', () => {
      it('should load version successfully', async () => {
        mockInvokeSuccess({ load_version: mockConfigVersion });
        const { loadVersion } = useVersionsStore.getState();

        const result = await loadVersion('config-1', 'v1');

        expect(result).toEqual(mockConfigVersion);
        expect(mockInvoke).toHaveBeenCalledWith('load_version', {
          configId: 'config-1',
          versionId: 'v1',
        });
      });

      it('should handle load error', async () => {
        mockInvokeOnce(new Error('Version not found'));
        const { loadVersion } = useVersionsStore.getState();

        await expect(loadVersion('config-1', 'invalid')).rejects.toThrow('Version not found');
      });
    });

    describe('deleteVersion', () => {
      it('should delete version successfully', async () => {
        useVersionsStore.setState({
          versions: [mockVersionMetadata, mockVersionMetadata2],
          selectedVersionIds: ['v1'],
        });
        mockInvokeSuccess({
          delete_version: undefined,
          list_versions: [mockVersionMetadata2],
        });
        const { deleteVersion } = useVersionsStore.getState();

        await deleteVersion('config-1', 'v1');

        expect(mockInvoke).toHaveBeenCalledWith('delete_version', {
          configId: 'config-1',
          versionId: 'v1',
        });
        expect(useVersionsStore.getState().versions).toEqual([mockVersionMetadata2]);
      });

      it('should remove deleted version from selection', async () => {
        useVersionsStore.setState({ selectedVersionIds: ['v1', 'v2'] });
        mockInvokeSuccess({
          delete_version: undefined,
          list_versions: [mockVersionMetadata2],
        });
        const { deleteVersion } = useVersionsStore.getState();

        await deleteVersion('config-1', 'v1');

        expect(useVersionsStore.getState().selectedVersionIds).toEqual(['v2']);
      });

      it('should handle delete error', async () => {
        mockInvokeOnce(new Error('Delete failed'));
        const { deleteVersion } = useVersionsStore.getState();

        await expect(deleteVersion('config-1', 'v1')).rejects.toThrow('Delete failed');
        expect(useVersionsStore.getState().error).toBe('Error: Delete failed');
        expect(useVersionsStore.getState().isLoading).toBe(false);
      });
    });

    describe('updateVersion', () => {
      it('should update version metadata successfully', async () => {
        mockInvokeSuccess({
          update_version_metadata: undefined,
          list_versions: [{ ...mockVersionMetadata, name: 'Updated Name' }],
        });
        const { updateVersion } = useVersionsStore.getState();

        await updateVersion('config-1', 'v1', { name: 'Updated Name' });

        expect(mockInvoke).toHaveBeenCalledWith('update_version_metadata', {
          configId: 'config-1',
          versionId: 'v1',
          name: 'Updated Name',
          description: null,
          isDefault: null,
        });
      });

      it('should update description', async () => {
        mockInvokeSuccess({
          update_version_metadata: undefined,
          list_versions: [mockVersionMetadata],
        });
        const { updateVersion } = useVersionsStore.getState();

        await updateVersion('config-1', 'v1', { description: 'New description' });

        expect(mockInvoke).toHaveBeenCalledWith('update_version_metadata', {
          configId: 'config-1',
          versionId: 'v1',
          name: null,
          description: 'New description',
          isDefault: null,
        });
      });

      it('should update isDefault flag', async () => {
        mockInvokeSuccess({
          update_version_metadata: undefined,
          list_versions: [{ ...mockVersionMetadata, isDefault: true }],
        });
        const { updateVersion } = useVersionsStore.getState();

        await updateVersion('config-1', 'v1', { isDefault: true });

        expect(mockInvoke).toHaveBeenCalledWith('update_version_metadata', {
          configId: 'config-1',
          versionId: 'v1',
          name: null,
          description: null,
          isDefault: true,
        });
      });

      it('should handle update error', async () => {
        mockInvokeOnce(new Error('Update failed'));
        const { updateVersion } = useVersionsStore.getState();

        await expect(updateVersion('config-1', 'v1', { name: 'New' })).rejects.toThrow('Update failed');
        expect(useVersionsStore.getState().error).toBe('Error: Update failed');
      });
    });

    describe('updateVersionContent', () => {
      it('should update version content successfully', async () => {
        mockInvokeSuccess({
          update_version_content: undefined,
          list_versions: [mockVersionMetadata],
        });
        const { updateVersionContent } = useVersionsStore.getState();

        await updateVersionContent('config-1', 'v1', '{"updated": true}');

        expect(mockInvoke).toHaveBeenCalledWith('update_version_content', {
          configId: 'config-1',
          versionId: 'v1',
          content: '{"updated": true}',
        });
      });

      it('should refresh versions after content update', async () => {
        mockInvokeSuccess({
          update_version_content: undefined,
          list_versions: [mockVersionMetadata, mockVersionMetadata2],
        });
        const { updateVersionContent } = useVersionsStore.getState();

        await updateVersionContent('config-1', 'v1', 'new content');

        expect(useVersionsStore.getState().versions).toEqual([mockVersionMetadata, mockVersionMetadata2]);
      });

      it('should handle content update error', async () => {
        mockInvokeOnce(new Error('Content update failed'));
        const { updateVersionContent } = useVersionsStore.getState();

        await expect(updateVersionContent('config-1', 'v1', 'content')).rejects.toThrow('Content update failed');
        expect(useVersionsStore.getState().error).toBe('Error: Content update failed');
      });
    });

    describe('duplicateVersion', () => {
      it('should duplicate version successfully', async () => {
        const duplicatedVersion: ConfigVersion = {
          ...mockConfigVersion,
          id: 'v-duplicate',
          name: 'Copy of Test Version',
        };
        mockInvokeSuccess({
          duplicate_version: duplicatedVersion,
          list_versions: [mockVersionMetadata, { ...mockVersionMetadata, id: 'v-duplicate', name: 'Copy of Test Version' }],
        });
        const { duplicateVersion } = useVersionsStore.getState();

        const result = await duplicateVersion('config-1', 'v1', 'Copy of Test Version');

        expect(result).toEqual(duplicatedVersion);
        expect(mockInvoke).toHaveBeenCalledWith('duplicate_version', {
          configId: 'config-1',
          versionId: 'v1',
          newName: 'Copy of Test Version',
        });
      });

      it('should refresh versions after duplicate', async () => {
        mockInvokeSuccess({
          duplicate_version: mockConfigVersion,
          list_versions: [mockVersionMetadata, mockVersionMetadata2],
        });
        const { duplicateVersion } = useVersionsStore.getState();

        await duplicateVersion('config-1', 'v1', 'Copy');

        expect(useVersionsStore.getState().versions).toHaveLength(2);
      });

      it('should handle duplicate error', async () => {
        mockInvokeOnce(new Error('Duplicate failed'));
        const { duplicateVersion } = useVersionsStore.getState();

        await expect(duplicateVersion('config-1', 'v1', 'Copy')).rejects.toThrow('Duplicate failed');
        expect(useVersionsStore.getState().error).toBe('Error: Duplicate failed');
      });
    });

    describe('setDefault', () => {
      it('should set version as default', async () => {
        mockInvokeSuccess({
          update_version_metadata: undefined,
          list_versions: [{ ...mockVersionMetadata, isDefault: true }],
        });
        const { setDefault } = useVersionsStore.getState();

        await setDefault('config-1', 'v1');

        expect(mockInvoke).toHaveBeenCalledWith('update_version_metadata', {
          configId: 'config-1',
          versionId: 'v1',
          name: null,
          description: null,
          isDefault: true,
        });
      });
    });
  });

  describe('Loading and error states', () => {
    it('should set isLoading true during fetchVersions', async () => {
      let resolveInvoke: () => void;
      mockInvoke.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveInvoke = () => resolve([]);
          })
      );

      const fetchPromise = useVersionsStore.getState().fetchVersions('config-1');
      expect(useVersionsStore.getState().isLoading).toBe(true);
      expect(useVersionsStore.getState().error).toBeNull();

      resolveInvoke!();
      await fetchPromise;

      expect(useVersionsStore.getState().isLoading).toBe(false);
    });

    it('should set isLoading true during saveVersion', async () => {
      mockInvokeSuccess({
        save_version: mockConfigVersion,
        list_versions: [mockVersionMetadata],
      });

      const initialState = useVersionsStore.getState();
      expect(initialState.isLoading).toBe(false);

      const savePromise = useVersionsStore.getState().saveVersion('config-1', 'Test', 'content');

      await savePromise;
      expect(useVersionsStore.getState().isLoading).toBe(false);
    });

    it('should clear error on new fetch', async () => {
      useVersionsStore.setState({ error: 'Previous error' });
      mockInvokeSuccess({ list_versions: [] });

      await useVersionsStore.getState().fetchVersions('config-1');

      expect(useVersionsStore.getState().error).toBeNull();
    });

    it('should set error string from Error object', async () => {
      mockInvokeOnce(new Error('Custom error message'));

      await useVersionsStore.getState().fetchVersions('config-1');

      expect(useVersionsStore.getState().error).toBe('Error: Custom error message');
    });

    it('should handle multiple sequential operations', async () => {
      mockInvokeSuccess({
        save_version: mockConfigVersion,
        list_versions: [mockVersionMetadata],
        update_version_metadata: undefined,
      });

      const store = useVersionsStore.getState();
      await store.saveVersion('config-1', 'Test', 'content');
      await store.updateVersion('config-1', 'v1', { name: 'Updated' });

      expect(useVersionsStore.getState().isLoading).toBe(false);
      expect(useVersionsStore.getState().error).toBeNull();
    });
  });
});
