import Link from "next/link";
import { ArrowRight, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  isLostStage,
  resolveBusinessSpine,
  type Business,
  type LifecycleStage,
  type ProgressStage,
} from "@/core/business";
import { moveBusinessStage, quickAddLead } from "../api/actions";
import { CrmChrome, StageBadge } from "./crm-atoms";

/**
 * Level 1 — the sales pipeline (ADR-024). Pre-won businesses as cards in
 * stage columns, button-driven stage moves (recorded in history + activity),
 * and a quick-add lead form. Full intake can be completed later; the card
 * links into the lead detail.
 */

const PIPELINE_COLUMNS: Array<{ stage: ProgressStage; hint: string }> = [
  { stage: "lead", hint: "Unqualified — just found or just landed" },
  { stage: "qualified", hint: "Real budget, real need, worth pitching" },
  { stage: "proposed", hint: "Proposal in their hands" },
];

const NEXT_STAGE: Partial<Record<LifecycleStage, ProgressStage>> = {
  lead: "qualified",
  qualified: "proposed",
  proposed: "won",
};

function LeadCard({ business }: { business: Business }) {
  const next = NEXT_STAGE[business.stage];
  const lost = isLostStage(business.stage);
  return (
    <li
      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-4"
      data-business-id={business.id}
      data-stage={business.stage}
    >
      <Link href={`/crm/${business.id}`} className="group min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-medium transition-colors group-hover:text-sky-300">
            {business.name}
          </p>
          {lost && <StageBadge stage={business.stage} />}
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {business.trade} · {business.location}
        </p>
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        {lost ? (
          <form
            action={async () => {
              "use server";
              await moveBusinessStage(business.id, "lead");
            }}
          >
            <Button size="sm" variant="outline" type="submit" className="gap-1.5">
              <RotateCcw className="size-3.5" />
              Reopen as lead
            </Button>
          </form>
        ) : (
          <>
            {next && (
              <form
                action={async () => {
                  "use server";
                  await moveBusinessStage(business.id, next);
                }}
              >
                <Button size="sm" type="submit" className="gap-1.5">
                  {next === "won" ? "Won" : `→ ${next}`}
                  <ArrowRight className="size-3.5" />
                </Button>
              </form>
            )}
            <Button
              size="sm"
              variant="ghost"
              render={<Link href={`/crm/${business.id}`} />}
            >
              Open
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

function Column({
  title,
  hint,
  businesses,
}: {
  title: string;
  hint: string;
  businesses: Business[];
}) {
  return (
    <section
      aria-label={title}
      className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border/60 bg-background/30 p-3"
      data-column={title}
    >
      <header className="flex items-center justify-between px-1">
        <h2 className="text-sm font-medium capitalize">{title}</h2>
        <span className="rounded-full border border-border/60 bg-muted/20 px-2 py-0.5 text-[11px] text-muted-foreground">
          {businesses.length}
        </span>
      </header>
      <p className="px-1 text-[11px] text-muted-foreground">{hint}</p>
      <ul className="flex flex-col gap-2.5">
        {businesses.map((business) => (
          <LeadCard key={business.id} business={business} />
        ))}
        {businesses.length === 0 && (
          <li className="rounded-xl border border-dashed border-border/50 p-4 text-center text-xs text-muted-foreground">
            Empty
          </li>
        )}
      </ul>
    </section>
  );
}

export async function CrmPipelinePage() {
  const spine = await resolveBusinessSpine();
  const all = await spine.businesses.list();
  const byStage = (stage: LifecycleStage) =>
    all.filter((business) => business.stage === stage);
  const lostBusinesses = all.filter((business) => isLostStage(business.stage));

  return (
    <CrmChrome active="Pipeline">
      {/* Quick-add: name, trade, location, contact — a Business record is born */}
      <form
        action={quickAddLead}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-border/60 bg-card/40 p-4"
      >
        <div className="flex min-w-40 flex-1 flex-col gap-1.5">
          <Label htmlFor="quick-name">Business name</Label>
          <Input id="quick-name" name="name" required placeholder="e.g. Kerbside Kings" />
        </div>
        <div className="flex min-w-36 flex-1 flex-col gap-1.5">
          <Label htmlFor="quick-trade">Trade</Label>
          <Input id="quick-trade" name="trade" required placeholder="e.g. Driveways" />
        </div>
        <div className="flex min-w-32 flex-1 flex-col gap-1.5">
          <Label htmlFor="quick-location">Location</Label>
          <Input id="quick-location" name="location" required placeholder="e.g. York" />
        </div>
        <div className="flex min-w-36 flex-1 flex-col gap-1.5">
          <Label htmlFor="quick-phone">Phone (optional)</Label>
          <Input id="quick-phone" name="phone" type="tel" placeholder="07…" />
        </div>
        <div className="flex min-w-40 flex-1 flex-col gap-1.5">
          <Label htmlFor="quick-email">Email (optional)</Label>
          <Input id="quick-email" name="email" type="email" placeholder="name@…" />
        </div>
        <Button type="submit" className="gap-1.5">
          <Plus className="size-4" />
          Add lead
        </Button>
      </form>

      {/* The board */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PIPELINE_COLUMNS.map((column) => (
          <Column
            key={column.stage}
            title={column.stage}
            hint={column.hint}
            businesses={byStage(column.stage)}
          />
        ))}
        <Column
          title="lost"
          hint="Not interested / not going ahead — always reopenable"
          businesses={lostBusinesses}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Winning a business creates its Build and moves it to the{" "}
        <Link href="/crm/build-queue" className="underline underline-offset-2">
          Build Queue
        </Link>
        . Lost cards keep their history and can be reopened any time.
      </p>
    </CrmChrome>
  );
}
