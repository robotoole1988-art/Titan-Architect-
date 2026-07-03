import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Lightbulb, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ALL_LIFECYCLE_STATES,
  resolveBusinessSpine,
  stageLabel,
  type Business,
} from "@/core/business";
import {
  resolveCplEstimate,
  resolveMarketDataProvider,
} from "@/core/market-intelligence";
import { resolveTradePitch } from "@/core/pitch-intelligence";
import { EstimateCard } from "@/features/market";
import { addBusinessNote, moveBusinessStage } from "../api/actions";
import { ActivityLog, CrmChrome, StageBadge } from "./crm-atoms";

/**
 * The lead/business detail (ADR-024): intake data, the full stage control
 * (with an optional reason — required context for lost states), the
 * timestamped activity log, and the pitch intelligence panel — Industry DNA
 * surfacing in the CRM as a deterministic knowledge module.
 */

function IntakeDatum({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground/90">{value}</span>
    </div>
  );
}

function PitchPanel({ business }: { business: Business }) {
  const pitch = resolveTradePitch(business.trade);
  return (
    <section
      aria-label="Pitch intelligence"
      className="flex flex-col gap-5 rounded-2xl border border-sky-400/20 bg-card/40 p-5"
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-400/10 text-sky-300">
            <Lightbulb className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Pitch intelligence</h2>
            <p className="text-[11px] text-muted-foreground">
              {pitch.matched === "general"
                ? "General trade knowledge"
                : `Matched: ${pitch.matched.replace("-", " & ")}`}{" "}
              · deterministic knowledge module
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Talking points
          </h3>
          <ul className="flex flex-col gap-1.5">
            {pitch.talkingPoints.map((point) => (
              <li key={point} className="flex gap-2 text-sm text-foreground/85">
                <span className="mt-[7px] size-1 shrink-0 rounded-full bg-sky-400/70" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Their pain points
          </h3>
          <ul className="flex flex-col gap-1.5">
            {pitch.painPoints.map((point) => (
              <li key={point} className="flex gap-2 text-sm text-foreground/85">
                <span className="mt-[7px] size-1 shrink-0 rounded-full bg-rose-400/70" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Objection handlers
        </h3>
        <div className="flex flex-col gap-2">
          {pitch.objections.map((handler) => (
            <details
              key={handler.objection}
              className="rounded-xl border border-border/60 bg-background/40 px-4 py-3"
            >
              <summary className="cursor-pointer text-sm font-medium">
                “{handler.objection}”
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {handler.response}
              </p>
            </details>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Average job values · indicative UK ranges
        </h3>
        <ul className="flex flex-col divide-y divide-border/40 rounded-xl border border-border/60 bg-background/40">
          {pitch.averageJobValues.map((value) => (
            <li
              key={value.job}
              className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
            >
              <span className="text-foreground/85">{value.job}</span>
              <span className="shrink-0 font-medium text-sky-200">
                {value.typicalRange}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export async function CrmLeadDetailPage({ businessId }: { businessId: string }) {
  const spine = await resolveBusinessSpine();
  const business = await spine.businesses.get(businessId);
  if (!business) notFound();
  const [entries, marketProvider] = await Promise.all([
    spine.activity.list(businessId),
    resolveMarketDataProvider(),
  ]);
  // The founder pitches with this lead's own economics on screen (ADR-025).
  const cplEstimate = await resolveCplEstimate(
    marketProvider,
    business.trade,
    business.location,
  );

  return (
    <CrmChrome active="Pipeline">
      <div className="flex flex-col gap-2">
        <Link
          href="/crm"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to pipeline
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">{business.name}</h2>
          <StageBadge stage={business.stage} />
        </div>
        <p className="text-sm text-muted-foreground">
          {business.trade} · {business.location}
          {business.contact?.phone ? ` · ${business.contact.phone}` : ""}
          {business.contact?.email ? ` · ${business.contact.email}` : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/businesses/${business.id}`} />}
            className="gap-1.5"
          >
            <Route className="size-3.5" />
            Journey
          </Button>
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/experience-studio?businessId=${business.id}`} />}
            className="gap-1.5"
          >
            Strategy
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-6">
          <EstimateCard estimate={cplEstimate} />
          <PitchPanel business={business} />
        </div>

        <div className="flex flex-col gap-6">
          {/* Stage control — the one place with the full state list + reason */}
          <section
            aria-label="Lifecycle stage"
            className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/40 p-5"
          >
            <h2 className="text-sm font-semibold">Lifecycle stage</h2>
            <form
              action={async (formData: FormData) => {
                "use server";
                await moveBusinessStage(
                  business.id,
                  String(formData.get("stage")),
                  String(formData.get("reason") ?? ""),
                );
              }}
              className="flex flex-col gap-2.5"
            >
              <select
                name="stage"
                aria-label="Stage"
                key={business.stage}
                defaultValue={business.stage}
                className="h-9 rounded-lg border border-border/60 bg-background px-2 text-sm capitalize"
              >
                {ALL_LIFECYCLE_STATES.map((stage) => (
                  <option key={stage} value={stage} className="capitalize">
                    {stageLabel(stage)}
                  </option>
                ))}
              </select>
              <Textarea
                name="reason"
                rows={2}
                placeholder="Reason (optional — e.g. why lost, why reopened)"
              />
              <div className="flex justify-end">
                <Button size="sm" type="submit">
                  Set stage
                </Button>
              </div>
            </form>
          </section>

          {/* Intake data */}
          <section
            aria-label="Intake data"
            className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/40 p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Intake data</h2>
              {!business.services && (
                <Button
                  size="sm"
                  variant="ghost"
                  render={<Link href="/business-intake" />}
                >
                  Complete intake
                </Button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <IntakeDatum label="Services" value={business.services} />
              <IntakeDatum label="Target customer" value={business.targetCustomer} />
              <IntakeDatum label="Goal" value={business.goal} />
              <IntakeDatum label="Budget" value={business.budget} />
              <IntakeDatum label="Urgency" value={business.urgency} />
              <IntakeDatum label="Current site" value={business.currentWebsiteUrl} />
            </div>
          </section>

          {/* Activity */}
          <section
            aria-label="Activity"
            className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/40 p-5"
          >
            <h2 className="text-sm font-semibold">Activity</h2>
            <form
              action={async (formData: FormData) => {
                "use server";
                await addBusinessNote(business.id, String(formData.get("note") ?? ""));
              }}
              className="flex items-start gap-2"
            >
              <Textarea
                name="note"
                rows={2}
                placeholder="Add a note — calls, promises, follow-ups…"
                className="flex-1"
              />
              <Button size="sm" type="submit">
                Log
              </Button>
            </form>
            <ActivityLog entries={entries} />
          </section>
        </div>
      </div>
    </CrmChrome>
  );
}
