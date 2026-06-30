"use client";

import { useCallback, useSyncExternalStore } from "react";
import { codexStore } from "../model/codex-store";
import type { CodexDraft } from "../model/types";

/**
 * Returns false during SSR and the first hydration render, then true once
 * mounted on the client. Lets components render a skeleton until the
 * localStorage-backed store has loaded, with no hydration mismatch and no
 * setState-in-effect.
 */
function useIsHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * React access to the local Codex store, via `useSyncExternalStore`. Returns the
 * current entries plus a `hydrated` flag and the mutation helpers.
 */
export function useCodex() {
  const entries = useSyncExternalStore(
    codexStore.subscribe,
    codexStore.getSnapshot,
    codexStore.getServerSnapshot,
  );
  const hydrated = useIsHydrated();

  const getById = useCallback(
    (id: string) => entries.find((entry) => entry.id === id),
    [entries],
  );
  const create = useCallback((draft: CodexDraft) => codexStore.create(draft), []);
  const update = useCallback(
    (id: string, draft: CodexDraft) => codexStore.update(id, draft),
    [],
  );
  const remove = useCallback((id: string) => codexStore.remove(id), []);

  return { entries, hydrated, getById, create, update, remove };
}
