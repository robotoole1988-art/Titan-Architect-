import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  resolveBusinessSpine,
  resolvePersistenceBackend,
  stageLabel,
} from "@/core/business";

/**
 * /businesses — every saved Business and where it stands (ADR-023). The seed
 * of the command centre: read-mostly, one row per business, links into its
 * journey. Not the full CRM.
 */
export async function BusinessesPage() {
  const spine = await resolveBusinessSpine();
  const businesses = await spine.businesses.list();
  const backend = resolvePersistenceBackend();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-emerald-400/80">
            Businesses
          </span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            The pipeline
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Every business TITAN knows about, and how far its journey has come.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Button render={<Link href="/business-intake" />} className="gap-2">
            <Briefcase className="size-4" />
            New intake
          </Button>
          <span className="text-[11px] text-muted-foreground">
            store: {backend === "supabase" ? "Supabase (durable)" : "in-memory (until restart)"}
          </span>
        </div>
      </header>

      {businesses.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/40 p-10 text-center text-sm text-muted-foreground">
          No businesses yet. Save a Business Intake and it appears here as a
          lead.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {businesses.map((business) => (
            <li key={business.id}>
              <Link
                href={`/businesses/${business.id}`}
                className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/40 px-5 py-4 transition-colors hover:border-emerald-400/30"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{business.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {business.trade} · {business.location}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] capitalize text-emerald-300/90">
                    {stageLabel(business.stage)}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
