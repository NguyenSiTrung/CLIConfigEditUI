import { Terminal, Wrench, FolderOpen, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onAddCustomTool: () => void;
}

export function WelcomeScreen({ onAddCustomTool }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center dark:bg-editor bg-white">
      <div className="max-w-md text-center px-6">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 dark:border-blue-500/30 border-blue-400/40 border flex items-center justify-center shadow-lg">
            <Terminal className="w-10 h-10 text-blue-500 dark:text-blue-400" />
          </div>
        </div>

        <h2 className="text-xl font-semibold dark:text-white text-slate-800 mb-2">
          Welcome to CLI Config Editor
        </h2>
        <p className="dark:text-gray-400 text-slate-500 text-sm mb-8">
          Select a tool from the sidebar to edit its configuration, or add your own custom tool.
        </p>

        <div className="grid grid-cols-1 gap-3 text-left mb-8">
          <FeatureItem
            icon={<FolderOpen className="w-4 h-4" />}
            title="Auto-detection"
            description="Automatically finds installed CLI tools"
          />
          <FeatureItem
            icon={<Zap className="w-4 h-4" />}
            title="Syntax highlighting"
            description="Full support for JSON, YAML, TOML, and INI"
          />
          <FeatureItem
            icon={<Wrench className="w-4 h-4" />}
            title="Custom tools"
            description="Add any config file you want to manage"
          />
        </div>

        <button
          onClick={onAddCustomTool}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 
                     text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20"
        >
          <Wrench className="w-4 h-4" />
          Add Custom Tool
        </button>
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg dark:bg-gray-800/50 bg-slate-50 border dark:border-gray-700/50 border-slate-200">
      <div className="p-2 rounded-lg dark:bg-blue-500/10 bg-blue-100 text-blue-500 dark:text-blue-400">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium dark:text-white text-slate-800">{title}</h3>
        <p className="text-xs dark:text-gray-500 text-slate-500">{description}</p>
      </div>
    </div>
  );
}
