import type { Directive, DirectiveDraft } from "./types";
import { MOCK_DIRECTIVES } from "./mock-data";

/**
 * Local Directives data store (v0.1).
 *
 * In-memory store, seeded from mock data and persisted to localStorage on the
 * client. This is the feature's data layer — a real backend later changes only
 * this module (and a future `api/`); the hook and components are unaffected.
 *
 * Shaped for React's `useSyncExternalStore`: `subscribe`, `getSnapshot`
 * (client) and `getServerSnapshot` (SSR seed).
 */

const STORAGE_KEY = "titan.directives.entries.v1";

/** Stable seed reference, used as the server snapshot — identity must not change. */
const SEED: Directive[] = [...MOCK_DIRECTIVES];

let directives: Directive[] = SEED;
let hydrated = false;
const listeners = new Set<() => void>();

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(directives));
  } catch {
    // Storage unavailable (private mode / quota) — continue in-memory.
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

function generateId(): string {
  return `directive_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function loadFromStorage(): void {
  if (typeof window === "undefined" || hydrated) return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      directives = JSON.parse(raw) as Directive[];
    } else {
      persist();
    }
  } catch {
    // Corrupt/unavailable storage — keep the in-memory seed.
  }
}

export const directivesStore = {
  getSnapshot(): Directive[] {
    return directives;
  },

  getServerSnapshot(): Directive[] {
    return SEED;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    if (!hydrated) {
      loadFromStorage();
      emit();
    }
    return () => {
      listeners.delete(listener);
    };
  },

  getById(id: string): Directive | undefined {
    return directives.find((directive) => directive.id === id);
  },

  create(draft: DirectiveDraft): Directive {
    const now = new Date().toISOString();
    const directive: Directive = {
      ...draft,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    directives = [directive, ...directives];
    persist();
    emit();
    return directive;
  },

  update(id: string, draft: DirectiveDraft): Directive | undefined {
    let updated: Directive | undefined;
    directives = directives.map((directive) => {
      if (directive.id !== id) return directive;
      updated = { ...directive, ...draft, updatedAt: new Date().toISOString() };
      return updated;
    });
    if (updated) {
      persist();
      emit();
    }
    return updated;
  },

  remove(id: string): void {
    const next = directives.filter((directive) => directive.id !== id);
    if (next.length !== directives.length) {
      directives = next;
      persist();
      emit();
    }
  },
};
