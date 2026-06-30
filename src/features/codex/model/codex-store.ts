import type { CodexDraft, CodexEntry } from "./types";
import { MOCK_CODEX_ENTRIES } from "./mock-data";

/**
 * Local Codex data store (v0.1).
 *
 * A simple in-memory store, seeded from mock data and persisted to
 * localStorage on the client. This is the feature's data layer — when a real
 * backend arrives, only this module (and a future `api/` module) changes; the
 * hook and components keep their interface.
 *
 * It exposes a pub/sub interface shaped for React's `useSyncExternalStore`:
 * `subscribe`, `getSnapshot` (client) and `getServerSnapshot` (SSR seed).
 */

const STORAGE_KEY = "titan.codex.entries.v1";

/** Stable seed reference, used as the server snapshot — its identity must not change. */
const SEED: CodexEntry[] = [...MOCK_CODEX_ENTRIES];

let entries: CodexEntry[] = SEED;
let hydrated = false;
const listeners = new Set<() => void>();

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage unavailable (private mode / quota) — continue in-memory.
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

function generateId(): string {
  return `codex_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Loads persisted entries once, on the client. */
function loadFromStorage(): void {
  if (typeof window === "undefined" || hydrated) return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      entries = JSON.parse(raw) as CodexEntry[];
    } else {
      persist(); // seed storage on first ever load
    }
  } catch {
    // Corrupt/unavailable storage — keep the in-memory seed.
  }
}

export const codexStore = {
  /** Current entries (client snapshot). Stable reference until a mutation. */
  getSnapshot(): CodexEntry[] {
    return entries;
  },

  /** Seed entries used during SSR and the first hydration render. */
  getServerSnapshot(): CodexEntry[] {
    return SEED;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    // On the first subscription, load persisted data and surface it.
    if (!hydrated) {
      loadFromStorage();
      emit();
    }
    return () => {
      listeners.delete(listener);
    };
  },

  getById(id: string): CodexEntry | undefined {
    return entries.find((entry) => entry.id === id);
  },

  create(draft: CodexDraft): CodexEntry {
    const entry: CodexEntry = {
      ...draft,
      id: generateId(),
      updatedAt: new Date().toISOString(),
    };
    entries = [entry, ...entries];
    persist();
    emit();
    return entry;
  },

  update(id: string, draft: CodexDraft): CodexEntry | undefined {
    let updated: CodexEntry | undefined;
    entries = entries.map((entry) => {
      if (entry.id !== id) return entry;
      updated = { ...entry, ...draft, updatedAt: new Date().toISOString() };
      return updated;
    });
    if (updated) {
      persist();
      emit();
    }
    return updated;
  },

  remove(id: string): void {
    const next = entries.filter((entry) => entry.id !== id);
    if (next.length !== entries.length) {
      entries = next;
      persist();
      emit();
    }
  },
};
