import { Terminal, Wrench, FolderOpen, Zap, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onAddCustomTool: () => void;
}

export function WelcomeScreen({ onAddCustomTool }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-w-0 bg-white dark:bg-[#020617] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px]"></div>
        <div className="absolute bottom-[0%] -left-[10%] w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[80px]"></div>
      </div>

      <div className="max-w-xl w-full text-center px-8 relative z-10 animate-fade-in">
        <div className="mb-8 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 backdrop-blur-xl border border-white/20 dark:border-white/10 flex items-center justify-center shadow-2xl">
              <Terminal className="w-12 h-12 text-indigo-500 dark:text-indigo-400 drop-shadow-lg" />
            </div>

            <div className="absolute -top-2 -right-2 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg rotate-12 animate-bounce hover:rotate-0 transition-transform">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold dark:text-white text-slate-900 mb-3 tracking-tight">
          CLI Config Editor
        </h2>
        <p className="dark:text-slate-400 text-slate-500 text-base mb-10 max-w-sm mx-auto leading-relaxed">
          The premium way to manage your scattered configuration files from one beautiful interface.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-10">
          <FeatureItem
            icon={<FolderOpen className="w-5 h-5" />}
            title="Auto Detect"
            description="Finds CLI tools automatically"
            color="text-emerald-500"
            bgColor="bg-emerald-500/10"
          />
          <FeatureItem
            icon={<Zap className="w-5 h-5" />}
            title="Smart Edit"
            description="Highlighting & Validation"
            color="text-amber-500"
            bgColor="bg-amber-500/10"
          />
          <FeatureItem
            icon={<Wrench className="w-5 h-5" />}
            title="Extensible"
            description="Add your own custom tools"
            color="text-purple-500"
            bgColor="bg-purple-500/10"
          />
        </div>

        <button
          onClick={onAddCustomTool}
          className="group inline-flex items-center gap-2.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 
                     text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/25 
                     hover:shadow-indigo-500/40 hover:-translate-y-0.5"
        >
          <Wrench className="w-4 h-4 group-hover:rotate-45 transition-transform" />
          <span>Add Custom Tool</span>
        </button>
      </div>
    </div>
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
    <div className="flex flex-col items-center text-center p-4 rounded-xl dark:bg-white/5 bg-white/50 border dark:border-white/5 border-slate-100 hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-colors group">
      <div className={`p-3 rounded-xl ${bgColor} ${color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-sm font-semibold dark:text-slate-200 text-slate-700 mb-1">{title}</h3>
      <p className="text-xs dark:text-slate-500 text-slate-500 leading-snug">{description}</p>
    </div>
  );
}
