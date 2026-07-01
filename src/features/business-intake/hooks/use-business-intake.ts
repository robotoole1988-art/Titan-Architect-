"use client";

import { useCallback, useSyncExternalStore } from "react";
import { businessIntakeStore } from "../model/business-intake-store";
import type { BusinessIntakeDraft } from "../model/types";

/**
 * False during SSR and the first hydration render, then true once mounted on the
 * client — lets components show a skeleton until the localStorage-backed store
 * has loaded, with no hydration mismatch and no setState-in-effect.
 */
function useIsHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** React access to the local Business Intake store, via `useSyncExternalStore`. */
export function useBusinessIntake() {
  const intakes = useSyncExternalStore(
    businessIntakeStore.subscribe,
    businessIntakeStore.getSnapshot,
    businessIntakeStore.getServerSnapshot,
  );
  const hydrated = useIsHydrated();

  const create = useCallback(
    (draft: BusinessIntakeDraft) => businessIntakeStore.create(draft),
    [],
  );
  const remove = useCallback((id: string) => businessIntakeStore.remove(id), []);

  return { intakes, hydrated, create, remove };
}
