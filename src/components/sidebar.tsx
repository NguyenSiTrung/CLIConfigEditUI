import { useState } from 'react';
import { ask } from '@tauri-apps/plugin-dialog';
import { useAppStore } from '@/stores/app-store';
import { CliTool, ConfigFile, CustomTool } from '@/types';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Bot,
  Zap,
  Github,
  Folder,
  Pencil,
  Trash2,
  MoreVertical,
  Sparkles,
  Box,
} from 'lucide-react';

const TOOL_ICONS: Record<string, React.ReactNode> = {
  'claude-code': <Bot className="w-4 h-4" />,
  'gemini-cli': <Sparkles className="w-4 h-4" />,
  'amp': <Zap className="w-4 h-4" />,
  'gh-copilot': <Github className="w-4 h-4" />,
  'cursor': <Box className="w-4 h-4" />,
  'opencode': <span className="w-4 h-4 flex items-center justify-center text-sm">⌬</span>,
};

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
}

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
}: SidebarProps) {
  const {
    activeToolId,
    activeConfigFileId,
    searchQuery,
    setSearchQuery,
    getFilteredTools,
    expandedTools,
    toggleToolExpanded,
    getToolConfigFiles,
  } = useAppStore();

  const { tools, custom } = getFilteredTools();

  return (
    <aside className="w-64 dark:bg-sidebar bg-slate-50 flex flex-col border-r dark:border-gray-700/50 border-slate-200 h-full">
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-gray-500 text-slate-400" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 dark:bg-gray-800/50 bg-white dark:text-white text-slate-800 rounded-lg text-sm
                       dark:placeholder-gray-500 placeholder-slate-400 border dark:border-gray-700/50 border-slate-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                       shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
        {/* CLI Tools Section */}
        <div className="mb-2">
          <div className="px-2 py-1.5 flex items-center justify-between text-xs font-semibold 
                         dark:text-gray-400 text-slate-500 uppercase tracking-wider">
            <span>CLI Tools</span>
            <span className="px-1.5 py-0.5 text-[10px] dark:bg-gray-700/50 bg-slate-200 dark:text-gray-400 text-slate-600 rounded-md font-medium">
              {tools.length}
            </span>
          </div>

          <ul className="mt-1 space-y-0.5">
            {tools.map((tool) => (
              <ToolItem
                key={tool.id}
                tool={tool}
                isExpanded={expandedTools.has(tool.id)}
                onToggle={() => toggleToolExpanded(tool.id)}
                configFiles={getToolConfigFiles(tool.id)}
                activeToolId={activeToolId}
                activeConfigFileId={activeConfigFileId}
                onConfigFileSelect={onConfigFileSelect}
                onAddConfigFile={onAddConfigFile}
                onEditConfigFile={onEditConfigFile}
                onDeleteConfigFile={onDeleteConfigFile}
              />
            ))}
          </ul>
        </div>

        {/* Custom Tools Section */}
        <CustomToolSection
          title="Custom"
          tools={custom}
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
        />
      </div>
    </aside>
  );
}

interface ToolItemProps {
  tool: CliTool;
  isExpanded: boolean;
  onToggle: () => void;
  configFiles: ConfigFile[];
  activeToolId: string | null;
  activeConfigFileId: string | null;
  onConfigFileSelect: (toolId: string, configFile: ConfigFile) => void;
  onAddConfigFile: (tool: CliTool) => void;
  onEditConfigFile: (tool: CliTool, configFile: ConfigFile) => void;
  onDeleteConfigFile: (toolId: string, configFileId: string) => void;
}

function ToolItem({
  tool,
  isExpanded,
  onToggle,
  configFiles,
  activeToolId,
  activeConfigFileId,
  onConfigFileSelect,
  onAddConfigFile,
  onEditConfigFile,
  onDeleteConfigFile,
}: ToolItemProps) {
  const hasConfigs = configFiles.length > 0;
  const isActive = activeToolId === tool.id;

  return (
    <li>
      <button
        onClick={onToggle}
        className={`w-full px-2 py-2 text-left flex items-center gap-2 text-sm rounded-lg
                   transition-all duration-150 group
                   ${isActive && !activeConfigFileId
                     ? 'bg-blue-600/10 dark:text-blue-400 text-blue-600'
                     : 'dark:text-gray-300 text-slate-700 dark:hover:bg-gray-800/50 hover:bg-white hover:shadow-sm'
                   }`}
      >
        <span className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
          <ChevronDown className="w-3 h-3 dark:text-gray-500 text-slate-400" />
        </span>
        <span className="flex-shrink-0 dark:text-gray-400 text-slate-500">
          {TOOL_ICONS[tool.id] || <Folder className="w-4 h-4" />}
        </span>
        <span className="truncate font-medium flex-1">{tool.name}</span>
        {hasConfigs && (
          <span className="px-1.5 py-0.5 text-[10px] dark:bg-gray-700/50 bg-slate-200 dark:text-gray-400 text-slate-500 rounded-md">
            {configFiles.length}
          </span>
        )}
      </button>

      {isExpanded && (
        <ul className="ml-5 mt-1 space-y-0.5 border-l dark:border-gray-700/50 border-slate-200 pl-2">
          {configFiles.map((configFile) => (
            <ConfigFileItem
              key={configFile.id}
              tool={tool}
              configFile={configFile}
              isActive={activeToolId === tool.id && activeConfigFileId === configFile.id}
              onSelect={() => onConfigFileSelect(tool.id, configFile)}
              onEdit={() => onEditConfigFile(tool, configFile)}
              onDelete={() => onDeleteConfigFile(tool.id, configFile.id)}
            />
          ))}
          <li>
            <button
              onClick={() => onAddConfigFile(tool)}
              className="w-full px-2 py-1.5 text-left flex items-center gap-2 text-xs rounded-md
                         dark:text-gray-500 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400
                         dark:hover:bg-gray-800/30 hover:bg-blue-50
                         transition-all duration-150"
            >
              <Plus className="w-3 h-3" />
              <span>Add config file</span>
            </button>
          </li>
        </ul>
      )}
    </li>
  );
}

interface ConfigFileItemProps {
  tool: CliTool;
  configFile: ConfigFile;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ConfigFileItem({ configFile, isActive, onSelect, onEdit, onDelete }: ConfigFileItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <li className="relative group">
      <button
        onClick={onSelect}
        className={`w-full px-2 py-1.5 text-left flex items-center gap-2 text-sm rounded-md
                   transition-all duration-150
                   ${isActive
                     ? 'bg-blue-600 text-white shadow-md'
                     : 'dark:text-gray-400 text-slate-600 dark:hover:bg-gray-800/50 hover:bg-white hover:shadow-sm'
                   }`}
      >
        <span className="text-sm">{configFile.icon || '📄'}</span>
        <span className="truncate font-medium flex-1">{configFile.label}</span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity
                     ${isActive ? 'hover:bg-blue-500' : 'dark:hover:bg-gray-700 hover:bg-slate-200'}`}
        >
          <MoreVertical className="w-3 h-3" />
        </span>
      </button>

      {menuOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 dark:bg-gray-800 bg-white rounded-lg shadow-lg border dark:border-gray-700 border-slate-200 py-1 min-w-[100px]">
            <button
              onClick={() => {
                onEdit();
                setMenuOpen(false);
              }}
              className="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 dark:text-gray-300 text-slate-700 dark:hover:bg-gray-700 hover:bg-slate-100"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                e.preventDefault();
                setMenuOpen(false);
                const confirmed = await ask(`Delete "${configFile.label}"?`, {
                  title: 'Confirm Delete',
                  kind: 'warning',
                });
                if (confirmed) {
                  onDelete();
                }
              }}
              className="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 text-red-500 dark:hover:bg-gray-700 hover:bg-slate-100"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
}

interface CustomToolItemProps {
  tool: CustomTool;
  isExpanded: boolean;
  onToggle: () => void;
  configFiles: ConfigFile[];
  activeToolId: string | null;
  activeConfigFileId: string | null;
  onConfigFileSelect: (toolId: string, configFile: ConfigFile) => void;
  onAddConfigFile: (tool: CustomTool) => void;
  onEditConfigFile: (tool: CustomTool, configFile: ConfigFile) => void;
  onDeleteConfigFile: (toolId: string, configFileId: string) => void;
  onEditTool: (tool: CustomTool) => void;
  onDeleteTool: (toolId: string) => void;
}

function CustomToolItem({
  tool,
  isExpanded,
  onToggle,
  configFiles,
  activeToolId,
  activeConfigFileId,
  onConfigFileSelect,
  onAddConfigFile,
  onEditConfigFile,
  onDeleteConfigFile,
  onEditTool,
  onDeleteTool,
}: CustomToolItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hasConfigs = configFiles.length > 0;
  const isActive = activeToolId === tool.id;

  return (
    <li>
      <div className="relative group">
        <button
          onClick={onToggle}
          className={`w-full px-2 py-2 text-left flex items-center gap-2 text-sm rounded-lg
                     transition-all duration-150 group
                     ${isActive && !activeConfigFileId
                       ? 'bg-blue-600/10 dark:text-blue-400 text-blue-600'
                       : 'dark:text-gray-300 text-slate-700 dark:hover:bg-gray-800/50 hover:bg-white hover:shadow-sm'
                     }`}
        >
          <span className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
            <ChevronDown className="w-3 h-3 dark:text-gray-500 text-slate-400" />
          </span>
          <span className="flex-shrink-0 text-base">
            {tool.icon || '🔧'}
          </span>
          <span className="truncate font-medium flex-1">{tool.name}</span>
          {hasConfigs && (
            <span className="px-1.5 py-0.5 text-[10px] dark:bg-gray-700/50 bg-slate-200 dark:text-gray-400 text-slate-500 rounded-md">
              {configFiles.length}
            </span>
          )}
          <span
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity
                       ${isActive ? 'hover:bg-blue-500/20' : 'dark:hover:bg-gray-700 hover:bg-slate-200'}`}
          >
            <MoreVertical className="w-3 h-3" />
          </span>
        </button>

        {menuOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-20 dark:bg-gray-800 bg-white rounded-lg shadow-lg border dark:border-gray-700 border-slate-200 py-1 min-w-[100px]">
              <button
                onClick={() => {
                  onEditTool(tool);
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 dark:text-gray-300 text-slate-700 dark:hover:bg-gray-700 hover:bg-slate-100"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setMenuOpen(false);
                  const confirmed = await ask(`Delete "${tool.name}"?`, {
                    title: 'Confirm Delete',
                    kind: 'warning',
                  });
                  if (confirmed) {
                    onDeleteTool(tool.id);
                  }
                }}
                className="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 text-red-500 dark:hover:bg-gray-700 hover:bg-slate-100"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {isExpanded && (
        <ul className="ml-5 mt-1 space-y-0.5 border-l dark:border-gray-700/50 border-slate-200 pl-2">
          {configFiles.map((configFile) => (
            <ConfigFileItem
              key={configFile.id}
              tool={tool as unknown as CliTool}
              configFile={configFile}
              isActive={activeToolId === tool.id && activeConfigFileId === configFile.id}
              onSelect={() => onConfigFileSelect(tool.id, configFile)}
              onEdit={() => onEditConfigFile(tool, configFile)}
              onDelete={() => onDeleteConfigFile(tool.id, configFile.id)}
            />
          ))}
          <li>
            <button
              onClick={() => onAddConfigFile(tool)}
              className="w-full px-2 py-1.5 text-left flex items-center gap-2 text-xs rounded-md
                         dark:text-gray-500 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400
                         dark:hover:bg-gray-800/30 hover:bg-blue-50
                         transition-all duration-150"
            >
              <Plus className="w-3 h-3" />
              <span>Add config file</span>
            </button>
          </li>
        </ul>
      )}
    </li>
  );
}

interface CustomToolSectionProps {
  title: string;
  tools: CustomTool[];
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

function CustomToolSection({
  title,
  tools,
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
}: CustomToolSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-2 py-1.5 flex items-center justify-between text-xs font-semibold 
                   dark:text-gray-400 text-slate-500 uppercase tracking-wider dark:hover:text-gray-300 hover:text-slate-700 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          {isExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          {title}
        </span>
        <span className="px-1.5 py-0.5 text-[10px] dark:bg-gray-700/50 bg-slate-200 dark:text-gray-400 text-slate-600 rounded-md font-medium">
          {tools.length}
        </span>
      </button>

      {isExpanded && (
        <ul className="mt-1 space-y-0.5">
          {tools.map((tool) => (
            <CustomToolItem
              key={tool.id}
              tool={tool}
              isExpanded={expandedTools.has(tool.id)}
              onToggle={() => onToggleExpanded(tool.id)}
              configFiles={getToolConfigFiles(tool.id)}
              activeToolId={activeToolId}
              activeConfigFileId={activeConfigFileId}
              onConfigFileSelect={onConfigFileSelect}
              onAddConfigFile={onAddConfigFile}
              onEditConfigFile={onEditConfigFile}
              onDeleteConfigFile={onDeleteConfigFile}
              onEditTool={onEditTool}
              onDeleteTool={onDeleteTool}
            />
          ))}
          <li>
            <button
              onClick={onAddTool}
              className="w-full px-2 py-1.5 text-left flex items-center gap-2 text-xs rounded-md
                         dark:text-gray-500 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400
                         dark:hover:bg-gray-800/30 hover:bg-blue-50
                         transition-all duration-150"
            >
              <Plus className="w-3 h-3" />
              <span>Add custom tool</span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
