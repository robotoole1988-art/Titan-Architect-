import Link from "next/link";
import { ArrowRight, Check, Eye, Hand, ShieldCheck, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  buildItemLabel,
  resolveBusinessSpine,
  type Build,
  type BuildItem,
  type BuildItemStatus,
  type Business,
} from "@/core/business";
import { setBuildItemStatus } from "../api/actions";
import { CrmChrome } from "./crm-atoms";

/**
 * Level 2 — the build production line (ADR-024). THE REVIEW GATE IS LAW: no
 * item reaches live without the founder's explicit approval here. v1 honesty:
 * only the website pipeline is automated; every other item is labelled
 * "manual" and its status is moved by hand until its department exists.
 */

const STATUS_STYLES: Record<BuildItemStatus, string> = {
  queued: "border-border/60 bg-muted/20 text-muted-foreground",
  building: "border-sky-400/25 bg-sky-400/10 text-sky-300/90",
  ai_check: "border-violet-400/25 bg-violet-400/10 text-violet-300/90",
  review: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  approved: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300/90",
  live: "border-emerald-400/40 bg-emerald-400/15 text-emerald-200",
};

function StatusChip({ status }: { status: BuildItemStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] ${STATUS_STYLES[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

/** The manual ladder up to the gate (review onwards is gate-controlled). */
const MANUAL_NEXT: Partial<Record<BuildItemStatus, BuildItemStatus>> = {
  queued: "building",
  building: "ai_check",
  ai_check: "review",
};

function ItemControls({
  businessId,
  item,
}: {
  businessId: string;
  item: BuildItem;
}) {
  if (item.status === "review") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <form
          action={async () => {
            "use server";
            await setBuildItemStatus(businessId, item.kind, "approved");
          }}
        >
          <Button size="sm" type="submit" className="gap-1.5">
            <Check className="size-3.5" />
            Approve
          </Button>
        </form>
        <form
          action={async (formData: FormData) => {
            "use server";
            await setBuildItemStatus(
              businessId,
              item.kind,
              "building",
              String(formData.get("note") ?? ""),
            );
          }}
          className="flex items-center gap-2"
        >
          <Textarea
            name="note"
            rows={1}
            placeholder="Send-back note…"
            className="min-h-9 w-44"
          />
          <Button size="sm" variant="outline" type="submit" className="gap-1.5">
            <Undo2 className="size-3.5" />
            Send back
          </Button>
        </form>
      </div>
    );
  }
  if (item.status === "approved") {
    return (
      <form
        action={async () => {
          "use server";
          await setBuildItemStatus(businessId, item.kind, "live");
        }}
      >
        <Button size="sm" type="submit" className="gap-1.5">
          Go live
          <ArrowRight className="size-3.5" />
        </Button>
      </form>
    );
  }
  const next = MANUAL_NEXT[item.status];
  if (next && item.manual) {
    return (
      <form
        action={async () => {
          "use server";
          await setBuildItemStatus(businessId, item.kind, next);
        }}
      >
        <Button size="sm" variant="outline" type="submit">
          → {next.replace("_", " ")}
        </Button>
      </form>
    );
  }
  return null;
}

function BuildCard({ build, business }: { build: Build; business: Business }) {
  return (
    <section
      aria-label={business.name}
      className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/40 p-5"
      data-build-business={business.id}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/crm/${business.id}`}
            className="font-medium transition-colors hover:text-sky-300"
          >
            {business.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            {business.trade} · {business.location} · build opened{" "}
            {new Date(build.createdAt).toLocaleDateString("en-GB")}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          render={
            <Link href={`/experience-studio/preview?businessId=${business.id}`} />
          }
          className="gap-1.5"
        >
          <Eye className="size-3.5" />
          Preview site
        </Button>
      </header>

      <ul className="flex flex-col divide-y divide-border/40">
        {build.items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 py-2.5"
            data-item-kind={item.kind}
            data-item-status={item.status}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="text-sm font-medium">{buildItemLabel(item.kind)}</span>
              <StatusChip status={item.status} />
              {item.manual && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <Hand className="size-3" />
                  manual
                </span>
              )}
              {item.note && (
                <span className="truncate text-xs text-muted-foreground">
                  “{item.note}”
                </span>
              )}
            </div>
            <ItemControls businessId={business.id} item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export async function CrmBuildQueuePage() {
  const spine = await resolveBusinessSpine();
  const [builds, businesses] = await Promise.all([
    spine.builds.list(),
    spine.businesses.list(),
  ]);
  const businessById = new Map(businesses.map((business) => [business.id, business]));

  const awaitingReview = builds.flatMap((build) =>
    build.items
      .filter((item) => item.status === "review")
      .map((item) => ({ build, item })),
  );

  return (
    <CrmChrome active="Build Queue">
      {/* The gate — everything waiting on the founder */}
      <section
        aria-label="Awaiting review"
        className="flex flex-col gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.04] p-5"
      >
        <header className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg border border-amber-400/25 bg-amber-400/10 text-amber-300">
            <ShieldCheck className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Awaiting your review</h2>
            <p className="text-[11px] text-muted-foreground">
              Nothing goes live without approval here — the gate is law.
            </p>
          </div>
        </header>
        {awaitingReview.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
            Nothing waiting. Items land here when they reach review.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {awaitingReview.map(({ build, item }) => {
              const business = businessById.get(build.businessId);
              if (!business) return null;
              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="text-sm font-medium">
                      {buildItemLabel(item.kind)}
                    </span>
                    <span className="truncate text-sm text-muted-foreground">
                      {business.name}
                    </span>
                    {item.kind === "website" ? (
                      <Link
                        href={`/experience-studio/preview?businessId=${business.id}`}
                        className="inline-flex items-center gap-1 text-xs text-sky-300 underline-offset-2 hover:underline"
                      >
                        <Eye className="size-3" />
                        preview
                      </Link>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        manual item — review offline
                      </span>
                    )}
                  </div>
                  <ItemControls businessId={business.id} item={item} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Every build */}
      {builds.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/40 p-10 text-center text-sm text-muted-foreground">
          No builds yet — win a business on the{" "}
          <Link href="/crm" className="underline underline-offset-2">
            pipeline
          </Link>{" "}
          and its build appears here.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {builds.map((build) => {
            const business = businessById.get(build.businessId);
            return business ? (
              <BuildCard key={build.id} build={build} business={business} />
            ) : null;
          })}
        </div>
      )}
    </CrmChrome>
  );
}
