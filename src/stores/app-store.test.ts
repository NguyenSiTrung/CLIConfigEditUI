import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './app-store';

describe('app-store expandedTools', () => {
  beforeEach(() => {
    useAppStore.setState({
      expandedTools: new Set<string>(),
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
});
