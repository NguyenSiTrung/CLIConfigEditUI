import { describe, it, expect, beforeEach } from 'vitest';
import { useToolVisibilityStore } from './tool-visibility-store';

describe('useToolVisibilityStore', () => {
  beforeEach(() => {
    useToolVisibilityStore.setState({
      pinnedTools: [],
      hiddenTools: [],
      toolOrder: [],
      showHiddenTools: false,
    });
  });

  describe('pin/unpin actions', () => {
    it('should pin a tool', () => {
      const { pinTool } = useToolVisibilityStore.getState();
      pinTool('claude-cli');
      
      expect(useToolVisibilityStore.getState().pinnedTools).toContain('claude-cli');
    });

    it('should not duplicate pinned tool', () => {
      const { pinTool } = useToolVisibilityStore.getState();
      pinTool('claude-cli');
      pinTool('claude-cli');
      
      expect(useToolVisibilityStore.getState().pinnedTools.filter(id => id === 'claude-cli')).toHaveLength(1);
    });

    it('should unpin a tool', () => {
      useToolVisibilityStore.setState({ pinnedTools: ['claude-cli', 'aider'] });
      const { unpinTool } = useToolVisibilityStore.getState();
      unpinTool('claude-cli');
      
      expect(useToolVisibilityStore.getState().pinnedTools).not.toContain('claude-cli');
      expect(useToolVisibilityStore.getState().pinnedTools).toContain('aider');
    });

    it('should toggle pin state', () => {
      const store = useToolVisibilityStore.getState();
      
      store.togglePinTool('claude-cli');
      expect(useToolVisibilityStore.getState().pinnedTools).toContain('claude-cli');
      
      useToolVisibilityStore.getState().togglePinTool('claude-cli');
      expect(useToolVisibilityStore.getState().pinnedTools).not.toContain('claude-cli');
    });

    it('should remove from hidden when pinning', () => {
      useToolVisibilityStore.setState({ hiddenTools: ['claude-cli'] });
      const { pinTool } = useToolVisibilityStore.getState();
      pinTool('claude-cli');
      
      expect(useToolVisibilityStore.getState().pinnedTools).toContain('claude-cli');
      expect(useToolVisibilityStore.getState().hiddenTools).not.toContain('claude-cli');
    });
  });

  describe('hide/show actions', () => {
    it('should hide a tool', () => {
      const { hideTool } = useToolVisibilityStore.getState();
      hideTool('claude-cli');
      
      expect(useToolVisibilityStore.getState().hiddenTools).toContain('claude-cli');
    });

    it('should not duplicate hidden tool', () => {
      const { hideTool } = useToolVisibilityStore.getState();
      hideTool('claude-cli');
      hideTool('claude-cli');
      
      expect(useToolVisibilityStore.getState().hiddenTools.filter(id => id === 'claude-cli')).toHaveLength(1);
    });

    it('should show (unhide) a tool', () => {
      useToolVisibilityStore.setState({ hiddenTools: ['claude-cli', 'aider'] });
      const { showTool } = useToolVisibilityStore.getState();
      showTool('claude-cli');
      
      expect(useToolVisibilityStore.getState().hiddenTools).not.toContain('claude-cli');
      expect(useToolVisibilityStore.getState().hiddenTools).toContain('aider');
    });

    it('should toggle hide state', () => {
      const store = useToolVisibilityStore.getState();
      
      store.toggleHideTool('claude-cli');
      expect(useToolVisibilityStore.getState().hiddenTools).toContain('claude-cli');
      
      useToolVisibilityStore.getState().toggleHideTool('claude-cli');
      expect(useToolVisibilityStore.getState().hiddenTools).not.toContain('claude-cli');
    });

    it('should remove from pinned when hiding', () => {
      useToolVisibilityStore.setState({ pinnedTools: ['claude-cli'] });
      const { hideTool } = useToolVisibilityStore.getState();
      hideTool('claude-cli');
      
      expect(useToolVisibilityStore.getState().hiddenTools).toContain('claude-cli');
      expect(useToolVisibilityStore.getState().pinnedTools).not.toContain('claude-cli');
    });
  });

  describe('reorder actions', () => {
    it('should set custom tool order', () => {
      const { reorderTools } = useToolVisibilityStore.getState();
      reorderTools(['aider', 'claude-cli', 'amp']);
      
      expect(useToolVisibilityStore.getState().toolOrder).toEqual(['aider', 'claude-cli', 'amp']);
    });

    it('should move tool up in order', () => {
      useToolVisibilityStore.setState({ toolOrder: ['claude-cli', 'aider', 'amp'] });
      const { moveToolUp } = useToolVisibilityStore.getState();
      moveToolUp('aider');
      
      expect(useToolVisibilityStore.getState().toolOrder).toEqual(['aider', 'claude-cli', 'amp']);
    });

    it('should not move first tool up', () => {
      useToolVisibilityStore.setState({ toolOrder: ['claude-cli', 'aider', 'amp'] });
      const { moveToolUp } = useToolVisibilityStore.getState();
      moveToolUp('claude-cli');
      
      expect(useToolVisibilityStore.getState().toolOrder).toEqual(['claude-cli', 'aider', 'amp']);
    });

    it('should move tool down in order', () => {
      useToolVisibilityStore.setState({ toolOrder: ['claude-cli', 'aider', 'amp'] });
      const { moveToolDown } = useToolVisibilityStore.getState();
      moveToolDown('aider');
      
      expect(useToolVisibilityStore.getState().toolOrder).toEqual(['claude-cli', 'amp', 'aider']);
    });

    it('should not move last tool down', () => {
      useToolVisibilityStore.setState({ toolOrder: ['claude-cli', 'aider', 'amp'] });
      const { moveToolDown } = useToolVisibilityStore.getState();
      moveToolDown('amp');
      
      expect(useToolVisibilityStore.getState().toolOrder).toEqual(['claude-cli', 'aider', 'amp']);
    });
  });

  describe('showHiddenTools toggle', () => {
    it('should toggle showHiddenTools', () => {
      const { toggleShowHiddenTools } = useToolVisibilityStore.getState();
      
      expect(useToolVisibilityStore.getState().showHiddenTools).toBe(false);
      
      toggleShowHiddenTools();
      expect(useToolVisibilityStore.getState().showHiddenTools).toBe(true);
      
      useToolVisibilityStore.getState().toggleShowHiddenTools();
      expect(useToolVisibilityStore.getState().showHiddenTools).toBe(false);
    });
  });

  describe('reset action', () => {
    it('should reset all visibility state', () => {
      useToolVisibilityStore.setState({
        pinnedTools: ['claude-cli'],
        hiddenTools: ['aider'],
        toolOrder: ['amp', 'claude-cli'],
        showHiddenTools: true,
      });
      
      const { resetVisibility } = useToolVisibilityStore.getState();
      resetVisibility();
      
      const state = useToolVisibilityStore.getState();
      expect(state.pinnedTools).toEqual([]);
      expect(state.hiddenTools).toEqual([]);
      expect(state.toolOrder).toEqual([]);
      expect(state.showHiddenTools).toBe(false);
    });
  });

  describe('helper functions', () => {
    it('should check if tool is pinned', () => {
      useToolVisibilityStore.setState({ pinnedTools: ['claude-cli'] });
      const { isPinned } = useToolVisibilityStore.getState();
      
      expect(isPinned('claude-cli')).toBe(true);
      expect(isPinned('aider')).toBe(false);
    });

    it('should check if tool is hidden', () => {
      useToolVisibilityStore.setState({ hiddenTools: ['aider'] });
      const { isHidden } = useToolVisibilityStore.getState();
      
      expect(isHidden('aider')).toBe(true);
      expect(isHidden('claude-cli')).toBe(false);
    });
  });

  describe('getSortedTools', () => {
    const mockTools = [
      { id: 'tool-a', name: 'Tool A' },
      { id: 'tool-b', name: 'Tool B' },
      { id: 'tool-c', name: 'Tool C' },
      { id: 'tool-d', name: 'Tool D' },
    ];

    it('should return tools in original order when no visibility settings', () => {
      const { getSortedTools } = useToolVisibilityStore.getState();
      const result = getSortedTools(mockTools);
      
      expect(result.pinned).toEqual([]);
      expect(result.visible.map(t => t.id)).toEqual(['tool-a', 'tool-b', 'tool-c', 'tool-d']);
      expect(result.hidden).toEqual([]);
    });

    it('should separate pinned tools from visible tools', () => {
      useToolVisibilityStore.setState({ pinnedTools: ['tool-b', 'tool-d'] });
      const { getSortedTools } = useToolVisibilityStore.getState();
      const result = getSortedTools(mockTools);
      
      expect(result.pinned.map(t => t.id)).toEqual(['tool-b', 'tool-d']);
      expect(result.visible.map(t => t.id)).toEqual(['tool-a', 'tool-c']);
      expect(result.hidden).toEqual([]);
    });

    it('should separate hidden tools from visible tools', () => {
      useToolVisibilityStore.setState({ hiddenTools: ['tool-a', 'tool-c'] });
      const { getSortedTools } = useToolVisibilityStore.getState();
      const result = getSortedTools(mockTools);
      
      expect(result.pinned).toEqual([]);
      expect(result.visible.map(t => t.id)).toEqual(['tool-b', 'tool-d']);
      expect(result.hidden.map(t => t.id)).toEqual(['tool-a', 'tool-c']);
    });

    it('should handle all three categories', () => {
      useToolVisibilityStore.setState({ 
        pinnedTools: ['tool-b'],
        hiddenTools: ['tool-d']
      });
      const { getSortedTools } = useToolVisibilityStore.getState();
      const result = getSortedTools(mockTools);
      
      expect(result.pinned.map(t => t.id)).toEqual(['tool-b']);
      expect(result.visible.map(t => t.id)).toEqual(['tool-a', 'tool-c']);
      expect(result.hidden.map(t => t.id)).toEqual(['tool-d']);
    });

    it('should maintain pinned order based on pinnedTools array order', () => {
      useToolVisibilityStore.setState({ pinnedTools: ['tool-d', 'tool-a', 'tool-b'] });
      const { getSortedTools } = useToolVisibilityStore.getState();
      const result = getSortedTools(mockTools);
      
      expect(result.pinned.map(t => t.id)).toEqual(['tool-d', 'tool-a', 'tool-b']);
    });

    it('should apply custom order to visible tools', () => {
      useToolVisibilityStore.setState({ 
        toolOrder: ['tool-c', 'tool-a', 'tool-b', 'tool-d']
      });
      const { getSortedTools } = useToolVisibilityStore.getState();
      const result = getSortedTools(mockTools);
      
      expect(result.visible.map(t => t.id)).toEqual(['tool-c', 'tool-a', 'tool-b', 'tool-d']);
    });

    it('should handle new tools not in toolOrder', () => {
      useToolVisibilityStore.setState({ 
        toolOrder: ['tool-b']
      });
      const { getSortedTools } = useToolVisibilityStore.getState();
      const result = getSortedTools(mockTools);
      
      expect(result.visible.map(t => t.id)).toEqual(['tool-b', 'tool-a', 'tool-c', 'tool-d']);
    });
  });
});
