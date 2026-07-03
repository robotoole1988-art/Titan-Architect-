import Link from "next/link";
import { ArrowRight, BarChart3, Eye, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildItemLabel,
  resolveBusinessSpine,
  type Build,
  type Business,
} from "@/core/business";
import { moveBusinessStage } from "../api/actions";
import { ActivityLog, CrmChrome, StageBadge } from "./crm-atoms";

/**
 * Level 3 — live customer accounts (ADR-024). The live campaign bundle per
 * business, its activity, and a performance panel scaffold. HONESTY RULE:
 * empty states are designed, numbers are never faked — measurement arrives
 * with its own department.
 */

function LiveBundle({ build }: { build: Build | null }) {
  const liveItems = build?.items.filter((item) => item.status === "live") ?? [];
  if (liveItems.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No items live yet — approve and launch them from the Build Queue.
      </p>
    );
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {liveItems.map((item) => (
        <li
          key={item.id}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200"
        >
          <Radio className="size-3" />
          {buildItemLabel(item.kind)}
          <span className="text-emerald-300/70">
            live since {new Date(item.updatedAt).toLocaleDateString("en-GB")}
          </span>
        </li>
      ))}
    </ul>
  );
}

async function AccountCard({ business }: { business: Business }) {
  const spine = await resolveBusinessSpine();
  const [build, entries] = await Promise.all([
    spine.builds.getForBusiness(business.id),
    spine.activity.list(business.id),
  ]);

  return (
    <section
      aria-label={business.name}
      className="flex flex-col gap-5 rounded-2xl border border-border/60 bg-card/40 p-5"
      data-account={business.id}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/crm/${business.id}`}
              className="font-medium transition-colors hover:text-sky-300"
            >
              {business.name}
            </Link>
            <StageBadge stage={business.stage} />
          </div>
          <p className="text-sm text-muted-foreground">
            {business.trade} · {business.location}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            render={
              <Link href={`/experience-studio/preview?businessId=${business.id}`} />
            }
            className="gap-1.5"
          >
            <Eye className="size-3.5" />
            Live site
          </Button>
          {business.stage === "live" && (
            <form
              action={async () => {
                "use server";
                await moveBusinessStage(business.id, "account");
              }}
            >
              <Button size="sm" variant="ghost" type="submit" className="gap-1.5">
                Convert to account
                <ArrowRight className="size-3.5" />
              </Button>
            </form>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-2">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Live bundle
        </h3>
        <LiveBundle build={build} />
      </div>

      {/* Performance scaffold — designed empty state, never fake numbers */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Performance
        </h3>
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 bg-background/30 px-4 py-5">
          <span className="flex size-9 items-center justify-center rounded-lg border border-border/60 bg-muted/20 text-muted-foreground">
            <BarChart3 className="size-4" />
          </span>
          <div>
            <p className="text-sm text-foreground/85">Measurement coming</p>
            <p className="text-xs text-muted-foreground">
              Calls, leads, and rankings will appear when tracking is wired in
              — TITAN never shows a number it didn&apos;t measure.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Recent activity
        </h3>
        <ActivityLog entries={entries.slice(0, 5)} />
      </div>
    </section>
  );
}

export async function CrmAccountsPage() {
  const spine = await resolveBusinessSpine();
  const accounts = (await spine.businesses.list()).filter(
    (business) => business.stage === "live" || business.stage === "account",
  );

  return (
    <CrmChrome active="Accounts">
      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/40 p-10 text-center text-sm text-muted-foreground">
          No live accounts yet. When a build&apos;s website goes live, the
          business lands here with its campaign bundle.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {accounts.map((business) => (
            <AccountCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </CrmChrome>
  );
}
