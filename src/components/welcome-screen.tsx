import { Terminal, Wrench, FolderOpen, Zap, Sparkles, ChevronRight, Scan, Settings, Server, Layers, Shield, ArrowRight, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui';

interface WelcomeScreenProps {
  onAddCustomTool: () => void;
  onOpenSettings?: () => void;
  onSwitchToMcp?: () => void;
  onOpenKeyboardShortcuts?: () => void;
}

export function WelcomeScreen({ onAddCustomTool, onOpenSettings, onSwitchToMcp, onOpenKeyboardShortcuts }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center min-w-0 bg-white dark:bg-[#020617] relative overflow-y-auto">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px]"></div>
        <div className="absolute bottom-[0%] -left-[10%] w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[80px]"></div>
      </div>

      <div className="max-w-2xl w-full text-center px-8 py-12 relative z-10 animate-fade-in">
        <div className="mb-6 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 backdrop-blur-xl border border-white/20 dark:border-white/10 flex items-center justify-center shadow-2xl">
              <Terminal className="w-10 h-10 text-indigo-500 dark:text-indigo-400 drop-shadow-lg" />
            </div>

            <div className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-lg rotate-12">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold dark:text-white text-slate-900 mb-2 tracking-tight">
          Welcome to CLI Config Editor
        </h2>
        <p className="dark:text-slate-400 text-slate-500 text-sm mb-8 max-w-md mx-auto">
          Manage configuration files for your AI coding assistants from one unified interface.
        </p>

        {/* Quick Start Steps */}
        <div className="bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-5 mb-8 text-left">
          <h3 className="text-sm font-semibold dark:text-slate-200 text-slate-700 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Quick Start
          </h3>
          <ol className="space-y-3">
            <QuickStartStep 
              number={1} 
              title="Select a tool from the sidebar" 
              description="Pre-installed CLI tools are auto-detected"
            />
            <QuickStartStep 
              number={2} 
              title="Choose a config file to edit" 
              description="Click on any config file to open it in the editor"
            />
            <QuickStartStep 
              number={3} 
              title="Make changes and save" 
              description="Use Ctrl/⌘+S to save your changes"
            />
          </ol>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <FeatureItem
            icon={<Scan className="w-4 h-4" />}
            title="Auto Detect"
            description="Finds CLI tools"
            color="text-emerald-500"
            bgColor="bg-emerald-500/10"
          />
          <FeatureItem
            icon={<FolderOpen className="w-4 h-4" />}
            title="Smart Edit"
            description="Syntax highlighting"
            color="text-amber-500"
            bgColor="bg-amber-500/10"
          />
          <FeatureItem
            icon={<Wrench className="w-4 h-4" />}
            title="Extensible"
            description="Add custom tools"
            color="text-purple-500"
            bgColor="bg-purple-500/10"
          />
        </div>

        {/* Power Features Section */}
        <div className="bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-5 mb-8 text-left">
          <h3 className="text-sm font-semibold dark:text-slate-200 text-slate-700 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Power Features
          </h3>
          <div className="space-y-3">
            <PowerFeatureItem
              icon={<Server className="w-4 h-4" />}
              title="MCP Sync"
              description="Sync MCP server configurations across Claude, Cursor, VS Code, and more"
              color="text-blue-500"
              bgColor="bg-blue-500/10"
              action={onSwitchToMcp ? { label: "Open MCP Sync", onClick: onSwitchToMcp } : undefined}
            />
            <PowerFeatureItem
              icon={<Layers className="w-4 h-4" />}
              title="Version History"
              description="Track changes over time and restore previous versions of your configs"
              color="text-violet-500"
              bgColor="bg-violet-500/10"
            />
            <PowerFeatureItem
              icon={<Shield className="w-4 h-4" />}
              title="Automatic Backups"
              description="Backups are created before each save—never lose your work"
              color="text-emerald-500"
              bgColor="bg-emerald-500/10"
              action={onOpenSettings ? { label: "Configure", onClick: onOpenSettings } : undefined}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={onAddCustomTool}
            leftIcon={<Wrench className="w-4 h-4" />}
          >
            Add Custom Tool
          </Button>
          {onOpenSettings && (
            <Button
              variant="outline"
              onClick={onOpenSettings}
              leftIcon={<Settings className="w-4 h-4" />}
            >
              Settings
            </Button>
          )}
        </div>

        {/* Footer with Keyboard Shortcuts */}
        {onOpenKeyboardShortcuts && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
            <button
              onClick={onOpenKeyboardShortcuts}
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 
                         hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mx-auto"
            >
              <Keyboard className="w-3.5 h-3.5" />
              Keyboard Shortcuts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickStartStep({ 
  number, 
  title, 
  description 
}: { 
  number: number; 
  title: string; 
  description: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
        {number}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium dark:text-slate-200 text-slate-700 flex items-center gap-1">
          {title}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </p>
        <p className="text-xs dark:text-slate-500 text-slate-500">{description}</p>
      </div>
    </li>
  );
}

function FeatureItem({
  icon,
  title,
  description,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-3 rounded-xl dark:bg-white/5 bg-white/50 border dark:border-white/5 border-slate-100 transition-colors">
      <div className={`p-2 rounded-lg ${bgColor} ${color} mb-2`}>
        {icon}
      </div>
      <h3 className="text-xs font-semibold dark:text-slate-200 text-slate-700">{title}</h3>
      <p className="text-xs dark:text-slate-500 text-slate-500">{description}</p>
    </div>
  );
}

function PowerFeatureItem({
  icon,
  title,
  description,
  color,
  bgColor,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
      <div className={`p-2 rounded-lg ${bgColor} ${color} flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium dark:text-slate-200 text-slate-700">{title}</h4>
        <p className="text-xs dark:text-slate-500 text-slate-500 mt-0.5">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex-shrink-0 flex items-center gap-1 px-2 py-1 text-xs font-medium 
                     text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300
                     hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors"
        >
          {action.label}
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
