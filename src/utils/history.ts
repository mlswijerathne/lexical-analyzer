export type HistorySummary = {
  tokens: number;
  symbols: number;
  errors: number;
  valid: number;
  lines?: number;
};

export type HistoryItem = {
  id: string;
  input: string;
  timestamp: string; // ISO string
  summary?: HistorySummary;
};

const STORAGE_KEY = 'lexical_history';

function safeParse(raw: string | null): HistoryItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as HistoryItem[];
    return [];
  } catch (e) {
    // If corrupted, clear it to avoid repeated parse failures
    try { localStorage.removeItem(STORAGE_KEY); } catch {};
    return [];
  }
}

//Retrieve full history
export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return safeParse(raw).slice();
}

//Clear stored history.
export function clearHistory(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {

  }
}

// Add a new item to history, keeping only the most recent `limit` items (default 20)
export function addToHistory(item: { input: string; summary?: HistorySummary }, limit = 20): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const current = getHistory();
  const newItem: HistoryItem = {
    id: Date.now().toString(),
    input: item.input,
    timestamp: new Date().toISOString(),
    summary: item.summary
  };

  // Keep newest first
  const updated = [newItem, ...current].slice(0, limit);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    // Quota exceeded or other storage error - best-effort only
    console.error('Failed to save history to localStorage', e);
  }
}
