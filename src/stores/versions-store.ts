import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { ConfigVersion, VersionMetadata } from '@/types';

interface VersionsState {
  versions: VersionMetadata[];
  selectedVersionIds: string[];
  isLoading: boolean;
  error: string | null;
  currentConfigId: string | null;

  // Actions
  setCurrentConfigId: (configId: string | null) => void;
  fetchVersions: (configId: string) => Promise<void>;
  saveVersion: (configId: string, name: string, content: string, description?: string) => Promise<ConfigVersion>;
  loadVersion: (configId: string, versionId: string) => Promise<ConfigVersion>;
  deleteVersion: (configId: string, versionId: string) => Promise<void>;
  updateVersion: (configId: string, versionId: string, updates: { name?: string; description?: string; isDefault?: boolean }) => Promise<void>;
  updateVersionContent: (configId: string, versionId: string, content: string) => Promise<void>;
  duplicateVersion: (configId: string, versionId: string, newName: string) => Promise<ConfigVersion>;
  setDefault: (configId: string, versionId: string) => Promise<void>;
  toggleVersionSelection: (versionId: string) => void;
  clearSelection: () => void;
  clearVersions: () => void;
}

export const useVersionsStore = create<VersionsState>((set, get) => ({
  versions: [],
  selectedVersionIds: [],
  isLoading: false,
  error: null,
  currentConfigId: null,

  setCurrentConfigId: (configId) => {
    set({ currentConfigId: configId });
    if (configId) {
      get().fetchVersions(configId);
    } else {
      set({ versions: [], selectedVersionIds: [] });
    }
  },

  fetchVersions: async (configId) => {
    set({ isLoading: true, error: null });
    try {
      const versions = await invoke<VersionMetadata[]>('list_versions', { configId });
      set({ versions, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false, versions: [] });
    }
  },

  saveVersion: async (configId, name, content, description) => {
    set({ isLoading: true, error: null });
    try {
      const version = await invoke<ConfigVersion>('save_version', {
        configId,
        name,
        content,
        description: description || null,
        source: 'manual',
      });
      await get().fetchVersions(configId);
      set({ isLoading: false });
      return version;
    } catch (error) {
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  loadVersion: async (configId, versionId) => {
    const version = await invoke<ConfigVersion>('load_version', { configId, versionId });
    return version;
  },

  deleteVersion: async (configId, versionId) => {
    set({ isLoading: true, error: null });
    try {
      await invoke('delete_version', { configId, versionId });
      await get().fetchVersions(configId);
      set((state) => ({
        isLoading: false,
        selectedVersionIds: state.selectedVersionIds.filter((id) => id !== versionId),
      }));
    } catch (error) {
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  updateVersion: async (configId, versionId, updates) => {
    set({ isLoading: true, error: null });
    try {
      await invoke('update_version_metadata', {
        configId,
        versionId,
        name: updates.name || null,
        description: updates.description || null,
        isDefault: updates.isDefault ?? null,
      });
      await get().fetchVersions(configId);
      set({ isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  updateVersionContent: async (configId, versionId, content) => {
    set({ isLoading: true, error: null });
    try {
      await invoke('update_version_content', {
        configId,
        versionId,
        content,
      });
      await get().fetchVersions(configId);
      set({ isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  duplicateVersion: async (configId, versionId, newName) => {
    set({ isLoading: true, error: null });
    try {
      const version = await invoke<ConfigVersion>('duplicate_version', {
        configId,
        versionId,
        newName,
      });
      await get().fetchVersions(configId);
      set({ isLoading: false });
      return version;
    } catch (error) {
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  setDefault: async (configId, versionId) => {
    await get().updateVersion(configId, versionId, { isDefault: true });
  },

  toggleVersionSelection: (versionId) => {
    set((state) => {
      const isSelected = state.selectedVersionIds.includes(versionId);
      if (isSelected) {
        return { selectedVersionIds: state.selectedVersionIds.filter((id) => id !== versionId) };
      } else {
        // Max 2 selections for comparison
        const newSelection = state.selectedVersionIds.length >= 2
          ? [state.selectedVersionIds[1], versionId]
          : [...state.selectedVersionIds, versionId];
        return { selectedVersionIds: newSelection };
      }
    });
  },

  clearSelection: () => set({ selectedVersionIds: [] }),

  clearVersions: () => set({ versions: [], selectedVersionIds: [], currentConfigId: null }),
}));
