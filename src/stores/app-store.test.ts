import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './app-store';

describe('app-store expandedTools', () => {
  beforeEach(() => {
    useAppStore.setState({
      expandedTools: new Set<string>(),
      customTools: [],
    });
  });

  describe('toggleToolExpanded', () => {
    it('adds tool to expandedTools when not present', () => {
      const { toggleToolExpanded } = useAppStore.getState();
      
      toggleToolExpanded('test-tool');
      
      const { expandedTools } = useAppStore.getState();
      expect(expandedTools.has('test-tool')).toBe(true);
    });

    it('removes tool from expandedTools when already present', () => {
      useAppStore.setState({ expandedTools: new Set(['test-tool']) });
      const { toggleToolExpanded } = useAppStore.getState();
      
      toggleToolExpanded('test-tool');
      
      const { expandedTools } = useAppStore.getState();
      expect(expandedTools.has('test-tool')).toBe(false);
    });

    it('preserves other expanded tools when toggling', () => {
      useAppStore.setState({ expandedTools: new Set(['tool-a', 'tool-b']) });
      const { toggleToolExpanded } = useAppStore.getState();
      
      toggleToolExpanded('tool-a');
      
      const { expandedTools } = useAppStore.getState();
      expect(expandedTools.has('tool-a')).toBe(false);
      expect(expandedTools.has('tool-b')).toBe(true);
    });
  });

  describe('expand state persistence', () => {
    it('new tools default to collapsed (not in expandedTools)', () => {
      const { expandedTools } = useAppStore.getState();
      expect(expandedTools.has('new-tool')).toBe(false);
    });

    it('persisted expanded tools restore correctly', () => {
      useAppStore.setState({ expandedTools: new Set(['persisted-tool']) });
      
      const { expandedTools } = useAppStore.getState();
      expect(expandedTools.has('persisted-tool')).toBe(true);
    });

    it('expandedTools is a Set instance', () => {
      const { expandedTools } = useAppStore.getState();
      expect(expandedTools).toBeInstanceOf(Set);
    });
  });

  describe('expandAllTools', () => {
    it('expands all CLI tools', () => {
      const { expandAllTools } = useAppStore.getState();
      
      expandAllTools();
      
      const { expandedTools } = useAppStore.getState();
      expect(expandedTools.size).toBeGreaterThan(0);
    });

    it('includes custom tools when expanding all', () => {
      useAppStore.setState({
        customTools: [
          { id: 'custom-1', name: 'Custom Tool 1', configFiles: [] },
          { id: 'custom-2', name: 'Custom Tool 2', configFiles: [] },
        ],
      });
      const { expandAllTools } = useAppStore.getState();
      
      expandAllTools();
      
      const { expandedTools } = useAppStore.getState();
      expect(expandedTools.has('custom-1')).toBe(true);
      expect(expandedTools.has('custom-2')).toBe(true);
    });
  });

  describe('collapseAllTools', () => {
    it('collapses all tools', () => {
      useAppStore.setState({
        expandedTools: new Set(['tool-a', 'tool-b', 'tool-c']),
      });
      const { collapseAllTools } = useAppStore.getState();
      
      collapseAllTools();
      
      const { expandedTools } = useAppStore.getState();
      expect(expandedTools.size).toBe(0);
    });
  });
});
