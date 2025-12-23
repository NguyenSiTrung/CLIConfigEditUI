import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { CliTool, ConfigFile, CustomTool } from '@/types';
import { SidebarSearchBar } from './sidebar-search-bar';
import { CliToolsSection } from './cli-tools-section';
import { CustomToolsSection } from './custom-tools-section';
import { IdeExtensionsSection } from './ide-extensions-section';
import { CLI_TOOLS } from '@/utils/cli-tools';

interface SidebarProps {
  onConfigFileSelect: (toolId: string, configFile: ConfigFile) => void;
  onAddConfigFile: (tool: CliTool) => void;
  onEditConfigFile: (tool: CliTool, configFile: ConfigFile) => void;
  onDeleteConfigFile: (toolId: string, configFileId: string) => void;
  onAddCustomTool: () => void;
  onEditCustomTool: (tool: CustomTool) => void;
  onDeleteCustomTool: (toolId: string) => void;
  onAddCustomToolConfigFile: (tool: CustomTool) => void;
  onEditCustomToolConfigFile: (tool: CustomTool, configFile: ConfigFile) => void;
  onIdeExtensionConfigSelect?: (platformId: string, extensionId: string, settingPath: string | null) => void;
}

const MIN_WIDTH = 220;
const MAX_WIDTH = 400;

export function Sidebar({
  onConfigFileSelect,
  onAddConfigFile,
  onEditConfigFile,
  onDeleteConfigFile,
  onAddCustomTool,
  onEditCustomTool,
  onDeleteCustomTool,
  onAddCustomToolConfigFile,
  onEditCustomToolConfigFile,
  onIdeExtensionConfigSelect,
}: SidebarProps) {
  const activeToolId = useAppStore((state) => state.activeToolId);
  const activeConfigFileId = useAppStore((state) => state.activeConfigFileId);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const customTools = useAppStore((state) => state.customTools);
  const expandedTools = useAppStore((state) => state.expandedTools);
  const toggleToolExpanded = useAppStore((state) => state.toggleToolExpanded);
  const toolConfigs = useAppStore((state) => state.toolConfigs);
  const behaviorSettings = useAppStore((state) => state.behaviorSettings);
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((state) => state.setSidebarCollapsed);
  const sidebarWidth = useAppStore((state) => state.sidebarWidth);
  const setSidebarWidth = useAppStore((state) => state.setSidebarWidth);
  const isDirty = useAppStore((state) => state.isDirty);

  const tools = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return CLI_TOOLS.filter((t) => t.name.toLowerCase().includes(query));
  }, [searchQuery]);

  const custom = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return customTools.filter((t) => t.name.toLowerCase().includes(query));
  }, [customTools, searchQuery]);

  const getToolConfigFiles = useCallback(
    (toolId: string): ConfigFile[] => {
      const toolConfig = toolConfigs.find((tc) => tc.toolId === toolId);
      return toolConfig?.configFiles || [];
    },
    [toolConfigs]
  );

  const hasSearch = searchQuery.trim().length > 0;
  const hasMatches = tools.length + custom.length > 0;
  const previousExpandDefault = useRef(false);
  
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const justEnabled = behaviorSettings.expandToolsByDefault && !previousExpandDefault.current;
    previousExpandDefault.current = behaviorSettings.expandToolsByDefault;
    if (!justEnabled) return;
    const toolIds = [...CLI_TOOLS, ...customTools].map((tool) => tool.id);
    if (toolIds.length === 0) return;
    toolIds.forEach((toolId) => {
      if (!expandedTools.has(toolId)) {
        toggleToolExpanded(toolId);
      }
    });
  }, [behaviorSettings.expandToolsByDefault, customTools, expandedTools, toggleToolExpanded]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, setSidebarWidth]);

  if (sidebarCollapsed) {
    return (
      <aside 
        className="flex flex-col h-full border-r border-slate-200/60 dark:border-slate-800/60 
                       bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl
                       transition-all duration-300 ease-out flex-shrink-0"
        style={{ width: '56px', minWidth: '56px' }}
      >
        <div className="p-2 flex justify-center">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200
                      hover:bg-white dark:hover:bg-slate-800 
                      transition-all duration-200 active:scale-95
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <nav
      ref={sidebarRef}
      aria-label="Tool navigation"
      className="flex flex-col h-full border-r border-slate-200/60 dark:border-slate-800/60 
                bg-gradient-to-b from-slate-50/90 to-slate-100/50 
                dark:from-slate-900/90 dark:to-slate-900/60 
                backdrop-blur-xl relative flex-shrink-0"
      style={{ width: `${sidebarWidth}px`, minWidth: `${MIN_WIDTH}px`, maxWidth: `${MAX_WIDTH}px` }}
    >
      {/* Header with search and collapse button */}
      <div className="flex items-start gap-1 pr-2">
        <div className="flex-1">
          <SidebarSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <button
          type="button"
          onClick={() => setSidebarCollapsed(true)}
          className="mt-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300
                    hover:bg-white dark:hover:bg-slate-800 
                    transition-colors duration-200 active:scale-95
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Content area with sections */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin space-y-1">
        {/* No matches message */}
        {hasSearch && !hasMatches && (
          <div className="mx-1 rounded-xl border border-dashed border-slate-200/70 dark:border-slate-700/50 
                         bg-white/60 dark:bg-slate-800/40 px-4 py-6 text-center
                         animate-in fade-in duration-200">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl 
                           bg-slate-100 dark:bg-slate-700 mb-3">
              <span className="text-lg">🔍</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              No tools match "<span className="font-medium text-slate-700 dark:text-slate-300">{searchQuery}</span>"
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 
                        font-medium hover:underline transition-colors duration-150"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Section divider - only show when there's content */}
        {(tools.length > 0 || !hasSearch) && (
          <>
            <CliToolsSection
              tools={tools}
              hasSearch={hasSearch}
              activeToolId={activeToolId}
              activeConfigFileId={activeConfigFileId}
              expandedTools={expandedTools}
              onToggleExpanded={toggleToolExpanded}
              getToolConfigFiles={getToolConfigFiles}
              onConfigFileSelect={onConfigFileSelect}
              onAddConfigFile={onAddConfigFile}
              onEditConfigFile={onEditConfigFile}
              onDeleteConfigFile={onDeleteConfigFile}
              isDirty={isDirty}
            />

            <div className="mx-2 my-3 border-t border-slate-200/50 dark:border-slate-700/30" />
          </>
        )}

        <IdeExtensionsSection
          onExtensionConfigSelect={onIdeExtensionConfigSelect}
        />

        <div className="mx-2 my-3 border-t border-slate-200/50 dark:border-slate-700/30" />

        <CustomToolsSection
          tools={custom}
          hasSearch={hasSearch}
          activeToolId={activeToolId}
          activeConfigFileId={activeConfigFileId}
          expandedTools={expandedTools}
          onToggleExpanded={toggleToolExpanded}
          getToolConfigFiles={getToolConfigFiles}
          onConfigFileSelect={onConfigFileSelect}
          onAddConfigFile={onAddCustomToolConfigFile}
          onEditConfigFile={onEditCustomToolConfigFile}
          onDeleteConfigFile={onDeleteConfigFile}
          onAddTool={onAddCustomTool}
          onEditTool={onEditCustomTool}
          onDeleteTool={onDeleteCustomTool}
          isDirty={isDirty}
        />
      </div>

      {/* Resize handle - wider hit area (6px) with narrow visual indicator */}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize group
                   transition-colors duration-150`}
        title="Drag to resize"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
      >
        <div 
          className={`absolute right-0 top-0 bottom-0 w-0.5 
                     group-hover:bg-indigo-500/50 group-active:bg-indigo-500/70
                     transition-colors duration-150
                     ${isResizing ? 'bg-indigo-500/70' : 'bg-transparent'}`}
        />
      </div>
    </nav>
  );
}
