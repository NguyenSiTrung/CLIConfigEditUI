import { memo, useCallback, useMemo } from 'react';
import { FolderOpen, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CliTool, ConfigFile } from '@/types';
import { SidebarSection } from './sidebar-section';
import { SidebarToolItem } from './sidebar-tool-item';
import { SortableToolItem } from './sortable-tool-item';
import { useToolVisibilityStore } from '@/stores/tool-visibility-store';

interface CliToolsSectionProps {
  tools: CliTool[];
  hasSearch: boolean;
  activeToolId: string | null;
  activeConfigFileId: string | null;
  expandedTools: Set<string>;
  onToggleExpanded: (toolId: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  getToolConfigFiles: (toolId: string) => ConfigFile[];
  onConfigFileSelect: (toolId: string, configFile: ConfigFile) => void;
  onAddConfigFile: (tool: CliTool) => void;
  onEditConfigFile: (tool: CliTool, configFile: ConfigFile) => void;
  onDeleteConfigFile: (toolId: string, configFileId: string) => void;
  isDirty?: () => boolean;
}

export const CliToolsSection = memo(function CliToolsSection({
  tools,
  hasSearch,
  activeToolId,
  activeConfigFileId,
  expandedTools,
  onToggleExpanded,
  onExpandAll,
  onCollapseAll,
  getToolConfigFiles,
  onConfigFileSelect,
  onAddConfigFile,
  onEditConfigFile,
  onDeleteConfigFile,
  isDirty,
}: CliToolsSectionProps) {
  const pinnedTools = useToolVisibilityStore((state) => state.pinnedTools);
  const hiddenTools = useToolVisibilityStore((state) => state.hiddenTools);
  const showHiddenTools = useToolVisibilityStore((state) => state.showHiddenTools);
  const getSortedTools = useToolVisibilityStore((state) => state.getSortedTools);
  const togglePinTool = useToolVisibilityStore((state) => state.togglePinTool);
  const toggleHideTool = useToolVisibilityStore((state) => state.toggleHideTool);
  const toggleShowHiddenTools = useToolVisibilityStore((state) => state.toggleShowHiddenTools);
  const reorderTools = useToolVisibilityStore((state) => state.reorderTools);
  // Subscribe to toolOrder to trigger re-render when order changes
  useToolVisibilityStore((state) => state.toolOrder);

  const { pinned, visible, hidden } = getSortedTools(tools);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const pinnedIds = useMemo(() => pinned.map((t) => t.id), [pinned]);
  const visibleIds = useMemo(() => visible.map((t) => t.id), [visible]);
  const hiddenIds = useMemo(() => hidden.map((t) => t.id), [hidden]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      const isPinnedDrag = pinnedTools.includes(activeId);
      const currentList = isPinnedDrag ? [...pinnedTools] : [...visibleIds];

      const oldIndex = currentList.indexOf(activeId);
      const newIndex = currentList.indexOf(overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = [...currentList];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, activeId);

      if (isPinnedDrag) {
        useToolVisibilityStore.setState({ pinnedTools: newOrder });
      } else {
        // Preserve hidden tools in the order list
        reorderTools([...newOrder, ...hiddenIds]);
      }
    },
    [pinnedTools, visibleIds, hiddenIds, reorderTools]
  );

  const displayTools = showHiddenTools ? [...pinned, ...visible, ...hidden] : [...pinned, ...visible];
  const allExpanded = displayTools.length > 0 && displayTools.every((tool) => expandedTools.has(tool.id));
  const totalCount = tools.length;
  const hiddenCount = hidden.length;

  const expandCollapseAction = tools.length > 0 && (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={onExpandAll}
        disabled={allExpanded}
        title="Expand all tools"
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300
                   hover:bg-white dark:hover:bg-slate-800 transition-colors duration-200
                   disabled:opacity-30 disabled:cursor-not-allowed
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
      >
        <ChevronsDownUp className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onCollapseAll}
        disabled={expandedTools.size === 0}
        title="Collapse all tools"
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300
                   hover:bg-white dark:hover:bg-slate-800 transition-colors duration-200
                   disabled:opacity-30 disabled:cursor-not-allowed
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
      >
        <ChevronsUpDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  const renderToolItem = useCallback(
    (tool: CliTool, options: { showPinBadge?: boolean; wrapper?: (children: React.ReactNode) => React.ReactNode } = {}) => (
      <SidebarToolItem
        key={tool.id}
        tool={tool}
        configFiles={getToolConfigFiles(tool.id)}
        isExpanded={expandedTools.has(tool.id)}
        isActive={activeToolId === tool.id}
        activeConfigFileId={activeConfigFileId}
        isPinned={pinnedTools.includes(tool.id)}
        isHidden={hiddenTools.includes(tool.id)}
        showPinBadge={options.showPinBadge}
        onToggleExpanded={() => onToggleExpanded(tool.id)}
        onTogglePin={togglePinTool}
        onToggleHide={toggleHideTool}
        onConfigFileSelect={onConfigFileSelect}
        onAddConfigFile={onAddConfigFile}
        onEditConfigFile={onEditConfigFile}
        onDeleteConfigFile={onDeleteConfigFile}
        isDirty={isDirty}
        wrapper={options.wrapper}
      />
    ),
    [
      getToolConfigFiles,
      expandedTools,
      activeToolId,
      activeConfigFileId,
      pinnedTools,
      hiddenTools,
      onToggleExpanded,
      togglePinTool,
      toggleHideTool,
      onConfigFileSelect,
      onAddConfigFile,
      onEditConfigFile,
      onDeleteConfigFile,
      isDirty,
    ]
  );

  return (
    <SidebarSection
      title="CLI Tools"
      count={totalCount}
      accent="indigo"
      defaultExpanded={true}
      action={expandCollapseAction}
    >
      {displayTools.length === 0 ? (
        <div className="px-3 py-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl 
                         bg-slate-100 dark:bg-slate-800 mb-3">
            <FolderOpen className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {hasSearch ? 'No CLI tools match your search.' : 'No tools found.'}
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <ul className="space-y-0.5">
            {pinned.length > 0 && (
              <SortableContext items={pinnedIds} strategy={verticalListSortingStrategy}>
                {pinned.map((tool) =>
                  renderToolItem(tool, {
                    showPinBadge: true,
                    wrapper: (children) => (
                      <SortableToolItem key={tool.id} id={tool.id}>
                        {children}
                      </SortableToolItem>
                    ),
                  })
                )}
                {visible.length > 0 && (
                  <li className="mx-2 my-2 border-t border-slate-200/50 dark:border-slate-700/30" />
                )}
              </SortableContext>
            )}
            <SortableContext items={visibleIds} strategy={verticalListSortingStrategy}>
              {visible.map((tool) =>
                renderToolItem(tool, {
                  wrapper: (children) => (
                    <SortableToolItem key={tool.id} id={tool.id}>
                      {children}
                    </SortableToolItem>
                  ),
                })
              )}
            </SortableContext>
          </ul>

          {hiddenCount > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/30">
              <button
                type="button"
                onClick={toggleShowHiddenTools}
                className="w-full px-3 py-2 text-left flex items-center gap-2 text-xs rounded-lg
                          text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300
                          hover:bg-slate-100/50 dark:hover:bg-slate-800/50
                          transition-colors duration-200"
              >
                <span>
                  {showHiddenTools ? 'Hide' : 'Show'} {hiddenCount} hidden tool{hiddenCount > 1 ? 's' : ''}
                </span>
              </button>

              {showHiddenTools && (
                <ul className="mt-1 space-y-0.5 opacity-50">
                  {hidden.map((tool) => renderToolItem(tool))}
                </ul>
              )}
            </div>
          )}
        </DndContext>
      )}
    </SidebarSection>
  );
});
