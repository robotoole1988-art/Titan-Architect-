"use client";

import { useCallback, useSyncExternalStore } from "react";
import { directivesStore } from "../model/directives-store";
import type { DirectiveDraft } from "../model/types";

/**
 * False during SSR and the first hydration render, then true once mounted on
 * the client — lets components show a skeleton until the localStorage-backed
 * store has loaded, with no hydration mismatch and no setState-in-effect.
 */
function useIsHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * React access to the local Directives store, via `useSyncExternalStore`.
 */
export function useDirectives() {
  const directives = useSyncExternalStore(
    directivesStore.subscribe,
    directivesStore.getSnapshot,
    directivesStore.getServerSnapshot,
  );
  const hydrated = useIsHydrated();

  const getById = useCallback(
    (id: string) => directives.find((directive) => directive.id === id),
    [directives],
  );
  const create = useCallback(
    (draft: DirectiveDraft) => directivesStore.create(draft),
    [],
  );
  const update = useCallback(
    (id: string, draft: DirectiveDraft) => directivesStore.update(id, draft),
    [],
  );
  const remove = useCallback((id: string) => directivesStore.remove(id), []);

  return { directives, hydrated, getById, create, update, remove };
}
