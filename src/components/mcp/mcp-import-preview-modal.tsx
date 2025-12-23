import { useState, useMemo } from 'react';
import { McpServer, McpImportMode, McpDetectedFormat } from '@/types';
import { Modal, Button } from '@/components/ui';
import { FileJson, Check, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface ImportServerItem {
  server: McpServer;
  selected: boolean;
  hasConflict: boolean;
  overwriteExisting: boolean;
}

interface McpImportPreviewModalProps {
  isOpen: boolean;
  servers: McpServer[];
  sourcePath: string;
  detectedFormat: McpDetectedFormat;
  existingServers: McpServer[];
  onImport: (selectedServers: McpServer[], mode: McpImportMode, overwriteMap: Record<string, boolean>) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const formatLabels: Record<McpDetectedFormat, string> = {
  standard: 'Standard (mcpServers)',
  amp: 'Amp (amp.mcpServers)',
  copilot: 'Copilot (servers)',
  opencode: 'OpenCode (mcp.servers)',
};

export function McpImportPreviewModal({
  isOpen,
  servers,
  sourcePath,
  detectedFormat,
  existingServers,
  onImport,
  onClose,
  isLoading,
}: McpImportPreviewModalProps) {
  const [importMode, setImportMode] = useState<McpImportMode>('merge');
  const [showDetails, setShowDetails] = useState(false);

  const existingServerNames = useMemo(
    () => new Set(existingServers.map((s) => s.name)),
    [existingServers]
  );

  const [serverItems, setServerItems] = useState<ImportServerItem[]>(() =>
    servers.map((server) => ({
      server,
      selected: true,
      hasConflict: existingServerNames.has(server.name),
      overwriteExisting: true,
    }))
  );

  const toggleServer = (index: number) => {
    setServerItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleOverwrite = (index: number) => {
    setServerItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, overwriteExisting: !item.overwriteExisting } : item
      )
    );
  };

  const selectAll = () => {
    setServerItems((prev) => prev.map((item) => ({ ...item, selected: true })));
  };

  const deselectAll = () => {
    setServerItems((prev) => prev.map((item) => ({ ...item, selected: false })));
  };

  const selectedCount = serverItems.filter((item) => item.selected).length;
  const conflictCount = serverItems.filter((item) => item.selected && item.hasConflict).length;
  const newCount = serverItems.filter((item) => item.selected && !item.hasConflict).length;

  const handleImport = () => {
    const selectedServers = serverItems
      .filter((item) => item.selected)
      .map((item) => item.server);
    
    const overwriteMap: Record<string, boolean> = {};
    serverItems
      .filter((item) => item.selected && item.hasConflict)
      .forEach((item) => {
        overwriteMap[item.server.name] = item.overwriteExisting;
      });

    onImport(selectedServers, importMode, overwriteMap);
  };

  const truncatePath = (path: string, maxLength: number = 50) => {
    if (path.length <= maxLength) return path;
    const filename = path.split('/').pop() || path;
    if (filename.length >= maxLength - 3) {
      return '...' + filename.slice(-(maxLength - 3));
    }
    return '...' + path.slice(-(maxLength - 3));
  };

  const headerContent = (
    <div>
      <h2 className="text-lg font-semibold dark:text-slate-200 text-slate-800">
        Import MCP Servers
      </h2>
      <div className="flex items-center gap-2 mt-1">
        <FileJson className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span 
          className="text-xs text-slate-500 dark:text-slate-400 truncate" 
          title={sourcePath}
        >
          {truncatePath(sourcePath)}
        </span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex-shrink-0">
          {formatLabels[detectedFormat]}
        </span>
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex items-center justify-between w-full">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {selectedCount > 0 ? (
          <>
            {newCount > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400">+{newCount} new </span>
            )}
            {conflictCount > 0 && importMode === 'merge' && (
              <span className="text-amber-600 dark:text-amber-400">
                ⚠ {conflictCount} conflict{conflictCount !== 1 ? 's' : ''}
              </span>
            )}
            {importMode === 'replace' && existingServers.length > 0 && (
              <span className="text-rose-600 dark:text-rose-400">
                Will clear {existingServers.length} existing
              </span>
            )}
          </>
        ) : (
          'No servers selected'
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleImport}
          disabled={selectedCount === 0}
          isLoading={isLoading}
        >
          {isLoading ? 'Importing...' : `Import ${selectedCount} Server${selectedCount !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={headerContent as unknown as string}
      size="full"
      className="max-w-2xl"
      footer={footerContent}
    >
      {/* Import Mode Toggle */}
      <div className="mb-4 -mx-6 -mt-4 px-6 py-3 border-b border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Import mode:</span>
          <div className="flex rounded-lg bg-slate-200 dark:bg-slate-700 p-0.5">
            <button
              onClick={() => setImportMode('merge')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                importMode === 'merge'
                  ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-200 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Merge
            </button>
            <button
              onClick={() => setImportMode('replace')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                importMode === 'replace'
                  ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-200 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Replace
            </button>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {importMode === 'merge' 
              ? 'Add to existing servers'
              : 'Clear all existing servers first'}
          </span>
        </div>
      </div>

      {/* Select All / Deselect All */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {servers.length} server{servers.length !== 1 ? 's' : ''} found
        </span>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Select All
          </button>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <button
            onClick={deselectAll}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Server items */}
      <div className="space-y-2">
        {serverItems.map((item, index) => (
          <div
            key={item.server.name}
            className={`rounded-lg border transition-colors ${
              item.selected
                ? item.hasConflict
                  ? 'border-amber-300 dark:border-amber-500/50 bg-amber-50/50 dark:bg-amber-500/5'
                  : 'border-emerald-300 dark:border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/5'
                : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30'
            }`}
          >
            <div className="flex items-center gap-3 p-3">
              {/* Checkbox */}
              <button
                onClick={() => toggleServer(index)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  item.selected
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'
                }`}
              >
                {item.selected && <Check className="w-3 h-3" />}
              </button>

              {/* Server Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-slate-800 dark:text-slate-200">
                    {item.server.name}
                  </span>
                  {item.hasConflict && importMode === 'merge' && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-3 h-3" />
                      Exists
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                  {item.server.command || item.server.url || '(no command)'}
                  {item.server.args && item.server.args.length > 0 && (
                    <span className="text-slate-400 dark:text-slate-500">
                      {' '}
                      {item.server.args.slice(0, 2).join(' ')}
                      {item.server.args.length > 2 && '...'}
                    </span>
                  )}
                </div>
              </div>

              {/* Overwrite toggle for conflicts in merge mode */}
              {item.hasConflict && importMode === 'merge' && item.selected && (
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.overwriteExisting}
                    onChange={() => toggleOverwrite(index)}
                    className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                  />
                  Overwrite
                </label>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Details toggle */}
      {servers.length > 0 && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-4 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {showDetails ? 'Hide' : 'Show'} import details
        </button>
      )}

      {showDetails && (
        <div className="mt-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p><strong>Source:</strong> {sourcePath}</p>
          <p><strong>Format:</strong> {formatLabels[detectedFormat]}</p>
          <p><strong>Total servers:</strong> {servers.length}</p>
          <p><strong>Existing servers:</strong> {existingServers.length}</p>
        </div>
      )}
    </Modal>
  );
}
