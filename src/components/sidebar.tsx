import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { CliTool, CustomTool } from '@/types';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Bot,
  Wrench,
  Zap,
  Terminal,
  Github,
  FileCode,
  Brain,
  Settings,
  Folder,
  Pencil,
  Trash2,
  MoreVertical,
} from 'lucide-react';

const TOOL_ICONS: Record<string, React.ReactNode> = {
  'claude-cli': <Bot className="w-4 h-4" />,
  'aider': <Wrench className="w-4 h-4" />,
  'amp': <Zap className="w-4 h-4" />,
  'continue': <Terminal className="w-4 h-4" />,
  'gh-copilot': <Github className="w-4 h-4" />,
  'cursor': <FileCode className="w-4 h-4" />,
  'cody': <Brain className="w-4 h-4" />,
};

interface SidebarProps {
  onToolSelect: (toolId: string, isCustom: boolean) => void;
  onAddCustomTool: () => void;
  onEditCustomTool: (tool: CustomTool) => void;
  onDeleteCustomTool: (toolId: string) => void;
  onConfigureTool?: (tool: CliTool) => void;
}

export function Sidebar({ onToolSelect, onAddCustomTool, onEditCustomTool, onDeleteCustomTool, onConfigureTool }: SidebarProps) {
  const {
    activeToolId,
    searchQuery,
    setSearchQuery,
    getFilteredTools,
  } = useAppStore();

  const { installed, available, custom } = getFilteredTools();

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
        <ToolSection
          title="Installed"
          tools={installed}
          activeId={activeToolId}
          onSelect={(id) => onToolSelect(id, false)}
          defaultExpanded
          onConfigure={onConfigureTool}
        />

        <ToolSection
          title="Not Configured"
          tools={available}
          activeId={activeToolId}
          onSelect={(id) => onToolSelect(id, false)}
          dimmed
          defaultExpanded
          onConfigure={onConfigureTool}
        />

        <CustomToolSection
          title="Custom"
          tools={custom}
          activeId={activeToolId}
          onSelect={(id) => onToolSelect(id, true)}
          onAdd={onAddCustomTool}
          onEdit={onEditCustomTool}
          onDelete={onDeleteCustomTool}
        />
      </div>
    </aside>
  );
}

interface ToolSectionProps {
  title: string;
  tools: CliTool[];
  activeId: string | null;
  onSelect: (id: string) => void;
  dimmed?: boolean;
  defaultExpanded?: boolean;
  onConfigure?: (tool: CliTool) => void;
}

function ToolSection({ title, tools, activeId, onSelect, dimmed, defaultExpanded = true, onConfigure }: ToolSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (tools.length === 0) return null;

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
            <li key={tool.id} className="relative group">
              <button
                onClick={() => dimmed && onConfigure ? onConfigure(tool) : onSelect(tool.id)}
                className={`w-full px-2 py-2 text-left flex items-center gap-2.5 text-sm rounded-lg
                           transition-all duration-150
                           ${activeId === tool.id
                             ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                             : dimmed
                               ? 'dark:text-gray-500 text-slate-400 dark:hover:text-gray-300 hover:text-slate-600 dark:hover:bg-gray-800/50 hover:bg-white hover:shadow-sm'
                               : 'dark:text-gray-300 text-slate-700 dark:hover:bg-gray-800/50 hover:bg-white hover:shadow-sm'
                           }`}
              >
                <span className={`flex-shrink-0 ${activeId === tool.id ? 'text-white' : dimmed ? 'dark:text-gray-600 text-slate-400' : 'dark:text-gray-400 text-slate-500'}`}>
                  {TOOL_ICONS[tool.id] || <Folder className="w-4 h-4" />}
                </span>
                <span className="truncate font-medium flex-1">{tool.name}</span>
                {onConfigure && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfigure(tool);
                    }}
                    className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity
                               ${activeId === tool.id ? 'hover:bg-blue-500' : 'dark:hover:bg-gray-700 hover:bg-slate-200'}`}
                    title="Configure path"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface CustomToolSectionProps {
  title: string;
  tools: CustomTool[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onEdit: (tool: CustomTool) => void;
  onDelete: (toolId: string) => void;
}

function CustomToolSection({ title, tools, activeId, onSelect, onAdd, onEdit, onDelete }: CustomToolSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

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
            <li key={tool.id} className="relative group">
              <button
                onClick={() => onSelect(tool.id)}
                className={`w-full px-2 py-2 text-left flex items-center gap-2.5 text-sm rounded-lg
                           transition-all duration-150
                           ${activeId === tool.id
                             ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                             : 'dark:text-gray-300 text-slate-700 dark:hover:bg-gray-800/50 hover:bg-white hover:shadow-sm'
                           }`}
              >
                <Settings className={`w-4 h-4 flex-shrink-0 ${activeId === tool.id ? 'text-white' : 'dark:text-gray-400 text-slate-500'}`} />
                <span className="truncate font-medium flex-1">{tool.name}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === tool.id ? null : tool.id);
                  }}
                  className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity
                             ${activeId === tool.id ? 'hover:bg-blue-500' : 'dark:hover:bg-gray-700 hover:bg-slate-200'}`}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </span>
              </button>
              {menuOpenId === tool.id && (
                <div className="absolute right-0 top-full mt-1 z-10 dark:bg-gray-800 bg-white rounded-lg shadow-lg border dark:border-gray-700 border-slate-200 py-1 min-w-[120px]">
                  <button
                    onClick={() => {
                      onEdit(tool);
                      setMenuOpenId(null);
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 dark:text-gray-300 text-slate-700 dark:hover:bg-gray-700 hover:bg-slate-100"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${tool.name}"?`)) {
                        onDelete(tool.id);
                        setMenuOpenId(null);
                      }
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 text-red-500 dark:hover:bg-gray-700 hover:bg-slate-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
          <li>
            <button
              onClick={onAdd}
              className="w-full px-2 py-2 text-left flex items-center gap-2.5 text-sm rounded-lg
                         dark:text-gray-500 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 hover:bg-blue-50 
                         border border-dashed dark:border-gray-700 border-slate-300 hover:border-blue-400
                         transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Add Custom Tool</span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
