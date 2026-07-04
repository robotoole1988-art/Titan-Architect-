/**
 * Adapter resolution (ADR-023). Supabase activates ONLY when both server-side
 * env vars are present; otherwise the zero-setup in-memory adapter serves.
 * The resolved spine is a process singleton, parked on globalThis so Next dev
 * HMR module reloads don't reset in-memory data mid-session.
 */

import { createMemoryBusinessSpine } from "./memory-repository";
import type { BusinessSpineRepositories } from "./repository";

export type PersistenceBackend = "memory" | "supabase";

type EnvShape = Partial<Record<string, string>>;

/** Pure selection logic — supabase needs BOTH vars, else memory. */
export function resolvePersistenceBackend(
  env: EnvShape = process.env as EnvShape,
): PersistenceBackend {
  return env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY ? "supabase" : "memory";
}

/**
 * Bump when BusinessSpineRepositories gains a repository: the version is part
 * of the cache key, so a dev server that survived the upgrade via HMR cannot
 * serve a stale, incomplete spine.
 */
const SPINE_SHAPE_VERSION = 5;

const GLOBAL_KEY = Symbol.for(`titan.business-spine.v${SPINE_SHAPE_VERSION}`);

interface SpineGlobal {
  backend: PersistenceBackend;
  repos: BusinessSpineRepositories;
}

/**
 * The active spine for this server process. Server-side callers only (server
 * components, server actions); the Supabase adapter itself is `server-only`.
 */
export async function resolveBusinessSpine(): Promise<BusinessSpineRepositories> {
  const holder = globalThis as { [GLOBAL_KEY]?: SpineGlobal };
  const backend = resolvePersistenceBackend();
  if (holder[GLOBAL_KEY]?.backend === backend) {
    return holder[GLOBAL_KEY].repos;
  }
  const repos =
    backend === "supabase"
      ? (await import("./supabase-repository")).createSupabaseBusinessSpine({
          url: process.env.SUPABASE_URL!,
          serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })
      : createMemoryBusinessSpine();
  holder[GLOBAL_KEY] = { backend, repos };
  return repos;
}
