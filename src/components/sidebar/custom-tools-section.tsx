import { memo, useCallback } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { CustomTool, ConfigFile } from '@/types';
import { ACCENT_COLORS } from '@/constants/tool-icons';
import { SidebarSection } from './sidebar-section';
import { CollapsibleTreeItem } from './collapsible-tree-item';
import { ConfigFileItem } from './config-file-item';
import { ToolActionsMenu } from './tool-actions-menu';
import { useAppStore } from '@/stores/app-store';

interface CustomToolsSectionProps {
  tools: CustomTool[];
  hasSearch: boolean;
  activeToolId: string | null;
  activeConfigFileId: string | null;
  expandedTools: Set<string>;
  onToggleExpanded: (toolId: string) => void;
  getToolConfigFiles: (toolId: string) => ConfigFile[];
  onConfigFileSelect: (toolId: string, configFile: ConfigFile) => void;
  onAddConfigFile: (tool: CustomTool) => void;
  onEditConfigFile: (tool: CustomTool, configFile: ConfigFile) => void;
  onDeleteConfigFile: (toolId: string, configFileId: string) => void;
  onAddTool: () => void;
  onEditTool: (tool: CustomTool) => void;
  onDeleteTool: (toolId: string) => void;
}

export const CustomToolsSection = memo(function CustomToolsSection({
  tools,
  hasSearch,
  activeToolId,
  activeConfigFileId,
  expandedTools,
  onToggleExpanded,
  getToolConfigFiles,
  onConfigFileSelect,
  onAddConfigFile,
  onEditConfigFile,
  onDeleteConfigFile,
  onAddTool,
  onEditTool,
  onDeleteTool,
}: CustomToolsSectionProps) {
  const colors = ACCENT_COLORS.violet;
  const confirmBeforeDelete = useAppStore((state) => state.behaviorSettings.confirmBeforeDelete);

  const handleToggleExpanded = useCallback(
    (toolId: string) => onToggleExpanded(toolId),
    [onToggleExpanded]
  );

  return (
    <SidebarSection
      title="Custom Tools"
      count={tools.length}
      accent="violet"
      defaultExpanded={true}
    >
      {tools.length === 0 ? (
        <div className="px-3 py-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl 
                         bg-violet-100/50 dark:bg-violet-900/20 mb-3">
            <Sparkles className="w-6 h-6 text-violet-400" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {hasSearch ? 'No custom tools match your search.' : 'No custom tools yet.'}
          </p>
          {!hasSearch && (
            <button
              type="button"
              onClick={onAddTool}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                        text-violet-600 dark:text-violet-400 
                        bg-violet-50 dark:bg-violet-900/20
                        hover:bg-violet-100 dark:hover:bg-violet-900/30
                        rounded-lg transition-colors duration-200"
            >
              <Plus className="w-3 h-3" />
              Create Tool
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-0.5">
          {tools.map((tool) => {
            const configFiles = getToolConfigFiles(tool.id);
            const isExpanded = expandedTools.has(tool.id);
            const isActive = activeToolId === tool.id;
            const isChildActive = isActive && activeConfigFileId !== null;

            return (
              <CollapsibleTreeItem
                key={tool.id}
                label={tool.name}
                icon={
                  tool.icon ? (
                    <span className="text-base">{tool.icon}</span>
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )
                }
                isExpanded={isExpanded}
                isActive={isActive && !isChildActive}
                isChildActive={isChildActive}
                accent="violet"
                onToggle={() => handleToggleExpanded(tool.id)}
                badge={
                  configFiles.length > 0 ? (
                    <span 
                      className={`px-1.5 py-0.5 text-[10px] rounded-full font-medium
                                 transition-all duration-200
                                 ${isActive
                        ? `${colors.badge} ${colors.badgeText}`
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover/tool:bg-slate-200 dark:group-hover/tool:bg-slate-700'
                      }`}
                    >
                      {configFiles.length}
                    </span>
                  ) : undefined
                }
                actions={
                  <ToolActionsMenu
                    itemName={tool.name}
                    confirmBeforeDelete={confirmBeforeDelete}
                    onEdit={() => onEditTool(tool)}
                    onDelete={() => onDeleteTool(tool.id)}
                    onAddConfig={() => onAddConfigFile(tool)}
                  />
                }
              >
                {configFiles.map((configFile) => (
                  <ConfigFileItem
                    key={configFile.id}
                    configFile={configFile}
                    isActive={activeToolId === tool.id && activeConfigFileId === configFile.id}
                    onSelect={() => onConfigFileSelect(tool.id, configFile)}
                    onEdit={() => onEditConfigFile(tool, configFile)}
                    onDelete={() => onDeleteConfigFile(tool.id, configFile.id)}
                  />
                ))}
                
                <button
                  type="button"
                  onClick={() => onAddConfigFile(tool)}
                  className="w-full px-2.5 py-2 text-left flex items-center gap-2.5 text-xs rounded-xl
                            text-slate-400 hover:text-violet-600 dark:text-slate-500 dark:hover:text-violet-400
                            hover:bg-violet-50/80 dark:hover:bg-violet-900/20
                            border border-dashed border-transparent hover:border-violet-300 dark:hover:border-violet-700
                            transition-all duration-200 group/add 
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
                >
                  <div className="w-5 h-5 flex items-center justify-center rounded-lg 
                                 bg-slate-100 dark:bg-slate-800 
                                 group-hover/add:bg-violet-100 dark:group-hover/add:bg-violet-900/40
                                 transition-colors duration-200">
                    <Plus className="w-3 h-3" />
                  </div>
                  <span className="font-medium">Add Config</span>
                </button>
              </CollapsibleTreeItem>
            );
          })}
          
          <li className="pt-2">
            <button
              type="button"
              onClick={onAddTool}
              className="w-full px-3 py-2.5 text-left flex items-center gap-2.5 text-xs rounded-xl
                        text-slate-500 hover:text-violet-600 dark:text-slate-500 dark:hover:text-violet-400
                        border-2 border-dashed border-slate-200 dark:border-slate-700 
                        hover:border-violet-400 dark:hover:border-violet-500/50
                        hover:bg-violet-50/50 dark:hover:bg-violet-900/10
                        transition-all duration-200 group/add-tool
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
            >
              <div className="w-6 h-6 flex items-center justify-center rounded-lg 
                             bg-slate-100 dark:bg-slate-800 
                             group-hover/add-tool:bg-violet-100 dark:group-hover/add-tool:bg-violet-900/40
                             transition-colors duration-200">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium">Add Custom Tool</span>
            </button>
          </li>
        </ul>
      )}
    </SidebarSection>
  );
});
