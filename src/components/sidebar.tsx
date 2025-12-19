import { useState, useEffect, useCallback } from 'react';
import { ask } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '@/stores/app-store';
import { CliTool, ConfigFile, CustomTool } from '@/types';
import { IDE_PLATFORMS, IDE_EXTENSIONS } from '@/utils/cli-tools';
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
  Monitor,
  Puzzle,
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
  onIdeExtensionConfigSelect?: (platformId: string, extensionId: string, settingPath: string | null) => void;
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
  onIdeExtensionConfigSelect,
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
    <aside className="w-72 flex flex-col h-full border-r border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="p-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/60 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 rounded-lg text-sm
                       placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200/80 dark:border-slate-700/50
                       focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50
                       shadow-sm transition-all backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin space-y-4">
        {/* CLI Tools Section */}
        <CliToolsSection
          tools={tools}
          activeToolId={activeToolId}
          activeConfigFileId={activeConfigFileId}
          expandedTools={expandedTools}
          onToggleExpanded={toggleToolExpanded}
          getToolConfigFiles={getToolConfigFiles}
          onConfigFileSelect={onConfigFileSelect}
          onAddConfigFile={onAddConfigFile}
          onEditConfigFile={onEditConfigFile}
          onDeleteConfigFile={onDeleteConfigFile}
        />

        {/* IDE Extensions Section */}
        <IdeExtensionsSection
          onExtensionConfigSelect={onIdeExtensionConfigSelect}
        />

        {/* Custom Tools Section */}
        <CustomToolSection
          title="Custom Tools"
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
    <li className="mb-0.5">
      <button
        onClick={onToggle}
        className={`w-full px-2 py-2 text-left flex items-center gap-2 text-sm rounded-lg
                   transition-colors duration-200 group/tool
                   ${isActive && !activeConfigFileId
            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
      >
        <span className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
          <ChevronDown className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`} />
        </span>
        <span className={`flex-shrink-0 ${isActive ? 'text-indigo-500' : 'text-slate-500 dark:text-slate-500'}`}>
          {TOOL_ICONS[tool.id] || <Folder className="w-4 h-4" />}
        </span>
        <span className="truncate flex-1">{tool.name}</span>
        {hasConfigs && (
          <span className={`px-1.5 py-0.5 text-[10px] rounded-md transition-colors ${isActive
            ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover/tool:bg-slate-200 dark:group-hover/tool:bg-slate-700'
            }`}>
            {configFiles.length}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="relative ml-2.5 pl-3 border-l border-slate-200 dark:border-slate-800 my-1 space-y-0.5">
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
          <button
            onClick={() => onAddConfigFile(tool)}
            className="w-full px-2 py-1.5 text-left flex items-center gap-2 text-xs rounded-md
                       text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400
                       hover:bg-indigo-50 dark:hover:bg-indigo-900/10
                       transition-colors duration-150 group/add"
          >
            <div className="w-4 h-4 flex items-center justify-center rounded-sm bg-slate-100 dark:bg-slate-800 group-hover/add:bg-indigo-100 dark:group-hover/add:bg-indigo-900/30">
              <Plus className="w-3 h-3" />
            </div>
            <span>Add Config File</span>
          </button>
        </div>
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
    <div className="relative group/config">
      <button
        onClick={onSelect}
        className={`w-full px-2 py-1.5 text-left flex items-center gap-2 text-sm rounded-md
                   transition-colors duration-150 relative overflow-hidden
                   ${isActive
            ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-500/15'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
      >
        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-indigo-500 rounded-full" />}
        <span className="text-base opacity-75">{configFile.icon || '📄'}</span>
        <span className="truncate font-medium flex-1 pl-1">{configFile.label}</span>

        <div
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className={`p-1 rounded opacity-0 group-hover/config:opacity-100 transition-opacity
                     ${menuOpen ? 'opacity-100 bg-slate-200 dark:bg-slate-700' : ''}
                     hover:bg-slate-200 dark:hover:bg-slate-700`}
        >
          <MoreVertical className="w-3 h-3" />
        </div>
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 glass-panel rounded-lg shadow-xl py-1 min-w-[120px] animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={() => {
                onEdit();
                setMenuOpen(false);
              }}
              className="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <Pencil className="w-3.5 h-3.5" />
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
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:text-rose-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
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
    <li className="mb-0.5">
      <div className="relative group/custom">
        <button
          onClick={onToggle}
          className={`w-full px-2 py-2 text-left flex items-center gap-2 text-sm rounded-lg
                     transition-colors duration-200 group/tool
                     ${isActive && !activeConfigFileId
              ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 font-medium'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          <span className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
            <ChevronDown className={`w-3.5 h-3.5 ${isActive ? 'text-violet-500' : 'text-slate-400'}`} />
          </span>
          <span className="flex-shrink-0 text-base">
            {tool.icon || '🔧'}
          </span>
          <span className="truncate flex-1">{tool.name}</span>
          {hasConfigs && (
            <span className={`px-1.5 py-0.5 text-[10px] rounded-md transition-colors ${isActive
              ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
              {configFiles.length}
            </span>
          )}

          <div
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className={`p-1 rounded opacity-0 group-hover/custom:opacity-100 transition-opacity
                       ${menuOpen ? 'opacity-100 bg-slate-200 dark:bg-slate-700' : ''}
                       hover:bg-slate-200 dark:hover:bg-slate-700`}
          >
            <MoreVertical className="w-3 h-3" />
          </div>
        </button>


        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-20 glass-panel rounded-lg shadow-xl py-1 min-w-[120px] animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  onEditTool(tool);
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400"
              >
                <Pencil className="w-3.5 h-3.5" />
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
                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:text-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {isExpanded && (
        <div className="relative ml-2.5 pl-3 border-l border-slate-200 dark:border-slate-800 my-1 space-y-0.5">
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
          <button
            onClick={() => onAddConfigFile(tool)}
            className="w-full px-2 py-1.5 text-left flex items-center gap-2 text-xs rounded-md
                       text-slate-400 hover:text-violet-600 dark:text-slate-500 dark:hover:text-violet-400
                       hover:bg-violet-50 dark:hover:bg-violet-900/10
                       transition-all duration-150 group/add"
          >
            <div className="w-4 h-4 flex items-center justify-center rounded-sm bg-slate-100 dark:bg-slate-800 group-hover/add:bg-violet-100 dark:group-hover/add:bg-violet-900/30">
              <Plus className="w-3 h-3" />
            </div>
            <span>Add Config File</span>
          </button>
        </div>
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
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-2 py-1.5 flex items-center justify-between text-xs font-semibold 
                   text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          {isExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          {title}
        </span>
        <span className="px-1.5 py-0.5 text-[10px] bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-md font-medium">
          {tools.length}
        </span>
      </button>

      {isExpanded && (
        <ul className="mt-1">
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
          <li className="mt-1">
            <button
              onClick={onAddTool}
              className="w-full px-2 py-2 text-left flex items-center gap-2 text-xs rounded-lg
                         text-slate-500 hover:text-violet-600 dark:text-slate-500 dark:hover:text-violet-400
                         border border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500/50
                         hover:bg-violet-50 dark:hover:bg-violet-900/10
                         transition-all duration-150"
            >
              <Plus className="w-3 h-3" />
              <span>Add Custom Tool</span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

// CLI Tools Section
interface CliToolsSectionProps {
  tools: CliTool[];
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

function CliToolsSection({
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
}: CliToolsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-2 py-1.5 flex items-center justify-between text-xs font-semibold 
                   text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          {isExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          CLI Tools
        </span>
        <span className="px-1.5 py-0.5 text-[10px] bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md font-medium">
          {tools.length}
        </span>
      </button>

      {isExpanded && (
        <ul className="mt-1">
          {tools.map((tool) => (
            <ToolItem
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
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// IDE Extensions Section
interface IdeExtensionsSectionProps {
  onExtensionConfigSelect?: (platformId: string, extensionId: string, settingPath: string | null) => void;
}

function IdeExtensionsSection({ onExtensionConfigSelect }: IdeExtensionsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());
  const [expandedExtensions, setExpandedExtensions] = useState<Set<string>>(new Set());
  const [expandedAllSettings, setExpandedAllSettings] = useState<Set<string>>(new Set());
  const [settingStatus, setSettingStatus] = useState<Record<string, 'exists' | 'not-found' | 'loading'>>({});
  const [currentOs, setCurrentOs] = useState<string>('');

  useEffect(() => {
    invoke<string>('get_current_os').then(setCurrentOs);
  }, []);

  const checkSettingsExistence = useCallback(async (platformId: string) => {
    const platform = IDE_PLATFORMS.find(p => p.id === platformId);
    if (!platform || !currentOs) return;

    const settingsPath = platform.settingsPaths[currentOs as keyof typeof platform.settingsPaths];
    if (!settingsPath) return;

    for (const extConfig of platform.extensions || []) {
      const extension = IDE_EXTENSIONS.find(e => e.id === extConfig.extensionId);
      if (!extension?.suggestedSettings) continue;

      for (const setting of extension.suggestedSettings) {
        const fullPath = `${extension.settingsPrefix}.${setting.jsonPath}`;
        const key = `${platformId}-${fullPath}`;

        setSettingStatus(prev => ({ ...prev, [key]: 'loading' }));

        try {
          await invoke<string>('read_json_path', {
            path: settingsPath,
            jsonPath: fullPath,
          });
          setSettingStatus(prev => ({ ...prev, [key]: 'exists' }));
        } catch {
          setSettingStatus(prev => ({ ...prev, [key]: 'not-found' }));
        }
      }
    }
  }, [currentOs]);

  const togglePlatform = (platformId: string) => {
    setExpandedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(platformId)) {
        next.delete(platformId);
      } else {
        next.add(platformId);
        checkSettingsExistence(platformId);
      }
      return next;
    });
  };

  const toggleExtension = (key: string) => {
    setExpandedExtensions(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleAllSettings = (key: string) => {
    setExpandedAllSettings(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const getPlatformIcon = (platformId: string) => {
    switch (platformId) {
      case 'vscode':
        return <Monitor className="w-4 h-4 text-blue-500" />;
      case 'cursor':
        return <Box className="w-4 h-4 text-purple-500" />;
      case 'windsurf':
        return <span className="w-4 h-4 flex items-center justify-center">🏄</span>;
      case 'antigravity':
        return <span className="w-4 h-4 flex items-center justify-center">🚀</span>;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-2 py-1.5 flex items-center justify-between text-xs font-semibold 
                   text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          {isExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          IDE Extensions
        </span>
        <span className="px-1.5 py-0.5 text-[10px] bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md font-medium">
          {IDE_PLATFORMS.length}
        </span>
      </button>

      {isExpanded && (
        <ul className="mt-1">
          {IDE_PLATFORMS.map((platform) => (
            <li key={platform.id} className="mb-0.5">
              <button
                onClick={() => togglePlatform(platform.id)}
                className={`w-full px-2 py-2 text-left flex items-center gap-2 text-sm rounded-lg
                           transition-all duration-200 group
                           ${expandedPlatforms.has(platform.id)
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                <span className={`flex-shrink-0 transition-transform duration-200 ${expandedPlatforms.has(platform.id) ? 'rotate-0' : '-rotate-90'}`}>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </span>
                <span className="flex-shrink-0">
                  {getPlatformIcon(platform.id)}
                </span>
                <span className="truncate font-medium flex-1">{platform.name}</span>
                {platform.extensions && platform.extensions.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md">
                    {platform.extensions.length}
                  </span>
                )}
              </button>

              {expandedPlatforms.has(platform.id) && platform.extensions && (
                <ul className="ml-2.5 pl-3 border-l border-slate-200 dark:border-slate-800 my-1 space-y-0.5">
                  {platform.extensions.map((extConfig) => {
                    const extension = IDE_EXTENSIONS.find(e => e.id === extConfig.extensionId);
                    const extKey = `${platform.id}-${extConfig.extensionId}`;

                    return (
                      <li key={extConfig.extensionId}>
                        <button
                          onClick={() => toggleExtension(extKey)}
                          className={`w-full px-2 py-1.5 text-left flex items-center gap-2 text-sm rounded-md
                                     transition-all duration-150 relative
                                     ${expandedExtensions.has(extKey)
                              ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                          <span className={`flex-shrink-0 transition-transform duration-200 ${expandedExtensions.has(extKey) ? 'rotate-0' : '-rotate-90'}`}>
                            <ChevronDown className="w-3 h-3 opacity-50" />
                          </span>
                          <Puzzle className="w-3.5 h-3.5 text-amber-500" />
                          <span className="truncate font-medium flex-1">{extConfig.label}</span>
                        </button>

                        {expandedExtensions.has(extKey) && (
                          <ul className="ml-2.5 pl-3 border-l border-slate-200 dark:border-slate-800 my-1 space-y-0.5">
                            {/* All Settings */}
                            <li>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => toggleAllSettings(extKey)}
                                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
                                >
                                  <span className={`block transition-transform duration-200 ${expandedAllSettings.has(extKey) ? 'rotate-0' : '-rotate-90'}`}>
                                    <ChevronDown className="w-3 h-3" />
                                  </span>
                                </button>
                                <button
                                  onClick={() => onExtensionConfigSelect?.(
                                    platform.id,
                                    extConfig.extensionId,
                                    null
                                  )}
                                  className="flex-1 px-2 py-1.5 text-left flex items-center gap-2 text-xs rounded-md
                                             transition-all duration-150 font-medium
                                             text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                                >
                                  <span className="text-sm">📋</span>
                                  <span className="truncate flex-1">All Settings</span>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                    {extension?.settingsPrefix}.*
                                  </span>
                                </button>
                              </div>

                              {/* Nested suggested settings */}
                              {expandedAllSettings.has(extKey) && extension?.suggestedSettings && (
                                <ul className="ml-2.5 pl-3 border-l border-slate-200 dark:border-slate-800 my-1 space-y-0.5">
                                  {extension.suggestedSettings.map((setting) => {
                                    const fullPath = `${extension.settingsPrefix}.${setting.jsonPath}`;
                                    const statusKey = `${platform.id}-${fullPath}`;
                                    const status = settingStatus[statusKey];

                                    return (
                                      <li key={setting.jsonPath}>
                                        <button
                                          onClick={() => onExtensionConfigSelect?.(
                                            platform.id,
                                            extConfig.extensionId,
                                            fullPath
                                          )}
                                          className="w-full px-2 py-1.5 text-left flex items-center gap-2 text-xs rounded-md
                                                     transition-all duration-150
                                                     text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50
                                                     hover:text-indigo-600 dark:hover:text-indigo-400"
                                        >
                                          <span className="text-sm opacity-70">{setting.icon || '⚙️'}</span>
                                          <span className="truncate flex-1">{setting.label}</span>
                                          {status === 'loading' && (
                                            <span className="px-1.5 py-0.5 text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 rounded animate-pulse">
                                              ...
                                            </span>
                                          )}
                                          {status === 'exists' && (
                                            <span className="px-1.5 py-0.5 text-[9px] bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded">
                                              configured
                                            </span>
                                          )}
                                          {status === 'not-found' && (
                                            <span className="px-1.5 py-0.5 text-[9px] bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded">
                                              not set
                                            </span>
                                          )}
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </li>
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
