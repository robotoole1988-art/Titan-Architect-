/**
 * The active learning feed for this server process (ADR-046), resolved like
 * the Business Spine (ADR-023): Supabase when configured, memory otherwise,
 * cached per backend on globalThis.
 */

import {
  resolvePersistenceBackend,
  type PersistenceBackend,
} from "@/core/business";
import { createMemoryLearningFeed, type LearningFeed } from "./learning-feed";

const GLOBAL_KEY = Symbol.for("titan.learning-feed.v1");

interface FeedGlobal {
  backend: PersistenceBackend;
  feed: LearningFeed;
}

export async function resolveLearningFeed(): Promise<LearningFeed> {
  const holder = globalThis as { [GLOBAL_KEY]?: FeedGlobal };
  const backend = resolvePersistenceBackend();
  if (holder[GLOBAL_KEY]?.backend === backend) {
    return holder[GLOBAL_KEY].feed;
  }
  const feed =
    backend === "supabase"
      ? (await import("./supabase-feed")).createSupabaseLearningFeed({
          url: process.env.SUPABASE_URL!,
          serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })
      : createMemoryLearningFeed();
  holder[GLOBAL_KEY] = { backend, feed };
  return feed;
}
