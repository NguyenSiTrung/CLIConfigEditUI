import { Plus, FolderOpen } from 'lucide-react';
import { CliTool, ConfigFile } from '@/types';
import { TOOL_ICONS, DEFAULT_TOOL_ICON, ACCENT_COLORS } from '@/constants/tool-icons';
import { SidebarSection } from './sidebar-section';
import { CollapsibleTreeItem } from './collapsible-tree-item';
import { ConfigFileItem } from './config-file-item';

interface CliToolsSectionProps {
  tools: CliTool[];
  hasSearch: boolean;
  activeToolId: string | null;
  activeConfigFileId: string | null;
  expandedTools: Set<string>;
  onToggleExpanded: (toolId: string) => void;
  getToolConfigFiles: (toolId: string) => ConfigFile[];
  onConfigFileSelect: (toolId: string, configFile: ConfigFile) => void;
  onAddConfigFile: (tool: CliTool) => void;
  onEditConfigFile: (tool: CliTool, configFile: ConfigFile) => void;
  onDeleteConfigFile: (toolId: string, configFileId: string) => void;
}

export function CliToolsSection({
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
}: CliToolsSectionProps) {
  const colors = ACCENT_COLORS.indigo;

  return (
    <SidebarSection
      title="CLI Tools"
      count={tools.length}
      accent="indigo"
      defaultExpanded={true}
    >
      {tools.length === 0 ? (
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
                icon={TOOL_ICONS[tool.id] || DEFAULT_TOOL_ICON}
                isExpanded={isExpanded}
                isActive={isActive && !isChildActive}
                isChildActive={isChildActive}
                accent="indigo"
                onToggle={() => onToggleExpanded(tool.id)}
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
                            text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400
                            hover:bg-indigo-50/80 dark:hover:bg-indigo-900/20
                            border border-dashed border-transparent hover:border-indigo-300 dark:hover:border-indigo-700
                            transition-all duration-200 group/add 
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                >
                  <div className="w-5 h-5 flex items-center justify-center rounded-lg 
                                 bg-slate-100 dark:bg-slate-800 
                                 group-hover/add:bg-indigo-100 dark:group-hover/add:bg-indigo-900/40
                                 transition-colors duration-200">
                    <Plus className="w-3 h-3" />
                  </div>
                  <span className="font-medium">Add Config</span>
                </button>
              </CollapsibleTreeItem>
            );
          })}
        </ul>
      )}
    </SidebarSection>
  );
}
