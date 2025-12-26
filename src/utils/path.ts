/**
 * Get the filename from a file path, handling both Unix (/) and Windows (\) separators
 */
export function getFileName(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  
  // Split by both / and \ to handle cross-platform paths
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || undefined;
}

/**
 * Get the directory name from a file path, handling both Unix (/) and Windows (\) separators
 */
export function getDirName(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  
  // Split by both / and \ to handle cross-platform paths
  const parts = path.split(/[/\\]/);
  if (parts.length <= 1) return undefined;
  
  // Remove the last part (filename) and join with the original separator
  const separator = path.includes('\\') ? '\\' : '/';
  return parts.slice(0, -1).join(separator) || undefined;
}
