/**
 * The active Knowledge Kernel for this server process (ADR-046), resolved
 * exactly like the Business Spine (ADR-023): Supabase when both env vars are
 * present, memory otherwise, cached per backend on globalThis so dev-server
 * HMR cannot fork two kernels.
 */

import {
  resolvePersistenceBackend,
  type PersistenceBackend,
} from "@/core/business";
import { createKnowledgeKernel } from "./kernel";
import type { KnowledgeKernel } from "./knowledge-kernel";
import { createMemoryKnowledgeStore } from "./store";

const GLOBAL_KEY = Symbol.for("titan.knowledge-kernel.v1");

interface KernelGlobal {
  backend: PersistenceBackend;
  kernel: KnowledgeKernel;
}

export async function resolveKnowledgeKernel(): Promise<KnowledgeKernel> {
  const holder = globalThis as { [GLOBAL_KEY]?: KernelGlobal };
  const backend = resolvePersistenceBackend();
  if (holder[GLOBAL_KEY]?.backend === backend) {
    return holder[GLOBAL_KEY].kernel;
  }
  const store =
    backend === "supabase"
      ? (await import("./supabase-store")).createSupabaseKnowledgeStore({
          url: process.env.SUPABASE_URL!,
          serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })
      : createMemoryKnowledgeStore();
  const kernel = createKnowledgeKernel(store);
  holder[GLOBAL_KEY] = { backend, kernel };
  return kernel;
}
