const STORAGE_KEY = 'cli-config-editor-shown-hints';

// Global coordinator to prevent multiple tooltips showing simultaneously
let activeTooltipId: string | null = null;
const tooltipQueue: Array<{ id: string; show: () => void }> = [];

export function getShownHints(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // Ignore parse errors
  }
  return new Set();
}

export function markHintAsShown(hintId: string): void {
  const shown = getShownHints();
  shown.add(hintId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...shown]));
}

export function resetOnboardingHints(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Request to show a tooltip. If another tooltip is active, this one will be queued.
 * Returns true if the tooltip can show immediately, false if it was queued.
 */
export function requestTooltipDisplay(id: string, showCallback: () => void): boolean {
  if (activeTooltipId === null) {
    activeTooltipId = id;
    showCallback();
    return true;
  } else if (activeTooltipId !== id) {
    // Queue this tooltip to show after the current one is dismissed
    tooltipQueue.push({ id, show: showCallback });
    return false;
  }
  return false;
}

/**
 * Notify that a tooltip has been dismissed.
 * Shows the next queued tooltip if any.
 */
export function notifyTooltipDismissed(id: string): void {
  if (activeTooltipId === id) {
    activeTooltipId = null;
    
    // Show next queued tooltip after a short delay
    if (tooltipQueue.length > 0) {
      const next = tooltipQueue.shift();
      if (next) {
        setTimeout(() => {
          activeTooltipId = next.id;
          next.show();
        }, 500);
      }
    }
  }
}

/**
 * Cancel a queued tooltip request
 */
export function cancelTooltipRequest(id: string): void {
  const index = tooltipQueue.findIndex(t => t.id === id);
  if (index !== -1) {
    tooltipQueue.splice(index, 1);
  }
  if (activeTooltipId === id) {
    activeTooltipId = null;
  }
}
