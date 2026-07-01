import type { BusinessIntake, BusinessIntakeDraft } from "./types";
import { MOCK_BUSINESS_INTAKES } from "./mock-data";

/**
 * Local Business Intake store (v0.1).
 *
 * In-memory store, seeded from mock data and persisted to localStorage on the
 * client. This is the feature's data layer — a real backend later changes only
 * this module; the hook and components are unaffected. Shaped for React's
 * `useSyncExternalStore`.
 */

const STORAGE_KEY = "titan.business-intake.records.v1";

/** Stable seed reference used as the server snapshot — identity must not change. */
const SEED: BusinessIntake[] = [...MOCK_BUSINESS_INTAKES];

let intakes: BusinessIntake[] = SEED;
let hydrated = false;
const listeners = new Set<() => void>();

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(intakes));
  } catch {
    // Storage unavailable (private mode / quota) — continue in-memory.
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

function generateId(): string {
  return `intake_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function loadFromStorage(): void {
  if (typeof window === "undefined" || hydrated) return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      intakes = JSON.parse(raw) as BusinessIntake[];
    } else {
      persist();
    }
  } catch {
    // Corrupt/unavailable storage — keep the in-memory seed.
  }
}

export const businessIntakeStore = {
  getSnapshot(): BusinessIntake[] {
    return intakes;
  },

  getServerSnapshot(): BusinessIntake[] {
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

  create(draft: BusinessIntakeDraft): BusinessIntake {
    const now = new Date().toISOString();
    const intake: BusinessIntake = {
      ...draft,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    intakes = [intake, ...intakes];
    persist();
    emit();
    return intake;
  },

  remove(id: string): void {
    const next = intakes.filter((intake) => intake.id !== id);
    if (next.length !== intakes.length) {
      intakes = next;
      persist();
      emit();
    }
  },
};
