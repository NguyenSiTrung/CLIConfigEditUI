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

/**
 * Truncate a file path with middle ellipsis if it exceeds maxLength
 * Preserves the beginning (root/home) and end (filename) of the path
 */
export function truncatePath(path: string | null | undefined, maxLength: number = 50): string {
  if (!path) return '';
  if (path.length <= maxLength) return path;
  
  const separator = path.includes('\\') ? '\\' : '/';
  const parts = path.split(/[/\\]/);
  
  // Always show at least first and last parts
  if (parts.length <= 2) {
    // If only 2 parts, truncate the longer one
    const ellipsis = '…';
    const available = maxLength - ellipsis.length;
    const half = Math.floor(available / 2);
    return path.slice(0, half) + ellipsis + path.slice(-half);
  }
  
  const first = parts[0] || '';
  const last = parts[parts.length - 1] || '';
  const ellipsis = '…';
  
  // Calculate how much space we have for middle parts
  const fixedLength = first.length + last.length + 2 * separator.length + ellipsis.length;
  
  if (fixedLength >= maxLength) {
    // Path is too long even with just first/last, use simple truncation
    const available = maxLength - ellipsis.length;
    const half = Math.floor(available / 2);
    return path.slice(0, half) + ellipsis + path.slice(-half);
  }
  
  // Try to include more parts from the end (more relevant context)
  const result = first + separator + ellipsis;
  const remainingLength = maxLength - result.length - separator.length;
  
  // Add as many trailing parts as we can
  const trailingParts = [last];
  for (let i = parts.length - 2; i > 0; i--) {
    const newPart = parts[i];
    const newLength = trailingParts.reduce((acc, p) => acc + p.length + separator.length, 0) + newPart.length;
    if (newLength <= remainingLength) {
      trailingParts.unshift(newPart);
    } else {
      break;
    }
  }
  
  return result + separator + trailingParts.join(separator);
}
