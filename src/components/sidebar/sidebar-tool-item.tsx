import { memo, type ReactNode } from 'react';
import { Plus, Pin } from 'lucide-react';
import { CliTool, ConfigFile } from '@/types';
import { TOOL_ICONS, DEFAULT_TOOL_ICON, ACCENT_COLORS } from '@/constants/tool-icons';
import { CollapsibleTreeItem } from './collapsible-tree-item';
import { ConfigFileItem } from './config-file-item';
import { ToolHoverActions } from './tool-hover-actions';

interface SidebarToolItemProps {
  tool: CliTool;
  configFiles: ConfigFile[];
  isExpanded: boolean;
  isActive: boolean;
  activeConfigFileId: string | null;
  isPinned: boolean;
  isHidden: boolean;
  showPinBadge?: boolean;
  onToggleExpanded: () => void;
  onTogglePin: (toolId: string) => void;
  onToggleHide: (toolId: string) => void;
  onConfigFileSelect: (toolId: string, configFile: ConfigFile) => void;
  onAddConfigFile: (tool: CliTool) => void;
  onEditConfigFile: (tool: CliTool, configFile: ConfigFile) => void;
  onDeleteConfigFile: (toolId: string, configFileId: string) => void;
  isDirty?: () => boolean;
  wrapper?: (children: ReactNode) => ReactNode;
}

export const SidebarToolItem = memo(function SidebarToolItem({
  tool,
  configFiles,
  isExpanded,
  isActive,
  activeConfigFileId,
  isPinned,
  isHidden,
  showPinBadge = false,
  onToggleExpanded,
  onTogglePin,
  onToggleHide,
  onConfigFileSelect,
  onAddConfigFile,
  onEditConfigFile,
  onDeleteConfigFile,
  isDirty,
  wrapper,
}: SidebarToolItemProps) {
  const colors = ACCENT_COLORS.indigo;
  const isChildActive = isActive && activeConfigFileId !== null;

  const badge = showPinBadge ? (
    <div className="flex items-center gap-1">
      <Pin className="w-3 h-3 text-amber-500 dark:text-amber-400 group-hover/row:hidden" />
      {configFiles.length > 0 && (
        <span 
          className={`px-1.5 py-0.5 text-[11px] rounded-full font-medium
                     transition-all duration-200
                     ${isActive
            ? `${colors.badge} ${colors.badgeText}`
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover/tool:bg-slate-200 dark:group-hover/tool:bg-slate-700'
          }`}
        >
          {configFiles.length}
        </span>
      )}
    </div>
  ) : configFiles.length > 0 ? (
    <span 
      className={`px-1.5 py-0.5 text-[11px] rounded-full font-medium
                 transition-all duration-200
                 ${isActive
        ? `${colors.badge} ${colors.badgeText}`
        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover/tool:bg-slate-200 dark:group-hover/tool:bg-slate-700'
      }`}
    >
      {configFiles.length}
    </span>
  ) : undefined;

  const content = (
    <CollapsibleTreeItem
      label={tool.name}
      icon={TOOL_ICONS[tool.id] || DEFAULT_TOOL_ICON}
      isExpanded={isExpanded}
      isActive={isActive && !isChildActive}
      isChildActive={isChildActive}
      accent="indigo"
      onToggle={onToggleExpanded}
      actions={
        <ToolHoverActions
          toolId={tool.id}
          isPinned={isPinned}
          isHidden={isHidden}
          onTogglePin={onTogglePin}
          onToggleHide={onToggleHide}
        />
      }
      badge={badge}
    >
      {configFiles.map((configFile) => (
        <ConfigFileItem
          key={configFile.id}
          configFile={configFile}
          isActive={isActive && activeConfigFileId === configFile.id}
          hasUnsavedChanges={
            isActive && 
            activeConfigFileId === configFile.id && 
            isDirty?.() === true
          }
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

  return wrapper ? wrapper(content) : content;
});
