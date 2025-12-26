const STORAGE_KEY = 'cli-config-editor-shown-hints';

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
