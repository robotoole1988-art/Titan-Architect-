/**
 * Supabase adapter contract run — OPT-IN (ADR-023). Requires a reachable
 * Supabase instance (e.g. `supabase start`, needs Docker) and:
 *
 *   TITAN_SUPABASE_TEST=1 SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npm test
 *
 * Without the flag the suite is skipped; the in-memory run enforces the
 * contract everywhere.
 */

import { describe } from "vitest";
import { createSupabaseBusinessSpine } from "@/core/business";
import { runRepositoryContract } from "./repository-contract";

const enabled =
  process.env.TITAN_SUPABASE_TEST === "1" &&
  Boolean(process.env.SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

if (enabled) {
  runRepositoryContract("supabase", async () => {
    const repos = createSupabaseBusinessSpine({
      url: process.env.SUPABASE_URL!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    });
    // Contract tests create isolated records; clean the tables afterwards.
    return {
      repos,
      cleanup: async () => {
        for (const business of await repos.businesses.list()) {
          await repos.businesses.remove(business.id);
        }
      },
    };
  });
} else {
  describe.skip("repository contract · supabase (set TITAN_SUPABASE_TEST=1 to run)", () => {});
}
