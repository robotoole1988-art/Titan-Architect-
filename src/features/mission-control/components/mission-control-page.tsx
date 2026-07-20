import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  BrainCircuit,
  ClipboardCheck,
  Clock,
  Handshake,
  Inbox,
  LineChart,
  Radio,
} from "lucide-react";
import type {
  AccountSummary,
  Briefing,
  BuildQueueSection,
  EnquiryAttention,
  PipelineSection,
} from "@/core/mission-control";
import { Recommendations } from "@/features/brain";
import { resolveBriefing } from "../data/resolve-briefing";

/**
 * Mission Control (ADR-042) — the Brain's first surface. A deterministic daily
 * briefing built ONLY from existing internal data (CRM + first-party
 * measurement). Read-only: it surfaces and recommends; the founder acts with a
 * click through to the CRM. Every number is real and provenance-linked.
 */

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`;
}

function Card({
  title,
  icon: Icon,
  count,
  children,
  testId,
}: {
  title: string;
  icon: typeof Inbox;
  count?: number;
  children: React.ReactNode;
  testId: string;
}) {
  return (
    <section
      className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/40 p-5"
      data-section={testId}
    >
      <h2 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5" />
        {title}
        {count !== undefined && (
          <span className="ml-auto rounded-full border border-border/60 bg-muted/20 px-2 py-0.5 text-[10px] tabular-nums text-foreground/70">
            {count}
          </span>
        )}
      </h2>
      {children}
    </section>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border/50 px-4 py-3 text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function EnquiriesCard({ enquiries }: { enquiries: EnquiryAttention[] }) {
  return (
    <Card title="Enquiries needing attention" icon={Inbox} count={enquiries.length} testId="enquiries">
      {enquiries.length === 0 ? (
        <EmptyLine>No enquiries waiting — every lead has been actioned.</EmptyLine>
      ) : (
        <ul className="flex flex-col gap-2">
          {enquiries.slice(0, 6).map((enquiry) => (
            <li
              key={enquiry.enquiryId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/40 px-4 py-2.5"
              data-enquiry-attention
            >
              <span className="min-w-0">
                <Link href={enquiry.link} className="text-sm font-medium hover:text-sky-300">
                  {enquiry.name}
                </Link>
                <span className="ml-2 text-xs text-muted-foreground">
                  {enquiry.businessName} · {enquiry.sourcePage}
                </span>
              </span>
              <span className="flex items-center gap-2">
                {enquiry.slaBreached ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-rose-400/40 bg-rose-400/10 px-2 py-0.5 text-[10px] font-medium text-rose-300"
                    data-sla="breached"
                  >
                    <AlertTriangle className="size-3" />
                    {formatMinutes(enquiry.minutesPastSla)} past SLA
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300" data-sla="ok">
                    <Clock className="size-3" />
                    {formatMinutes(enquiry.ageMinutes)} old
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

const STAGE_LABELS: Record<string, string> = {
  lead: "Leads",
  qualified: "Qualified",
  proposed: "Proposals",
};

function PipelineCard({ pipeline }: { pipeline: PipelineSection }) {
  return (
    <Card title="Pipeline" icon={Handshake} count={pipeline.total} testId="pipeline">
      {pipeline.total === 0 ? (
        <EmptyLine>No active leads or deals in the pipeline yet.</EmptyLine>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            {pipeline.byStage.map((stage) => (
              <div
                key={stage.stage}
                className="rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-center"
                data-stage={stage.stage}
              >
                <p className="text-xl font-semibold tabular-nums">{stage.count}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {STAGE_LABELS[stage.stage] ?? stage.stage}
                </p>
              </div>
            ))}
          </div>
          {pipeline.dealsNeedingAction.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] uppercase tracking-wider text-amber-300/80">
                Deals needing a next action
              </p>
              {pipeline.dealsNeedingAction.map((item) => (
                <Link
                  key={item.businessId}
                  href={item.link}
                  className="flex items-center justify-between rounded-lg border border-amber-400/25 bg-amber-400/5 px-3 py-1.5 text-xs hover:border-amber-400/50"
                  data-deal-stale
                >
                  <span className="font-medium">{item.businessName}</span>
                  <span className="text-amber-300/90">stale {item.daysSinceMovement}d</span>
                </Link>
              ))}
            </div>
          )}
          {pipeline.stale.length > 0 && pipeline.dealsNeedingAction.length === 0 && (
            <p className="text-xs text-muted-foreground">
              {pipeline.stale.length} item{pipeline.stale.length > 1 ? "s" : ""} with no
              movement in a week —{" "}
              <Link href={pipeline.stale[0].link} className="text-amber-300 hover:underline">
                oldest is {pipeline.stale[0].businessName} ({pipeline.stale[0].daysSinceMovement}d)
              </Link>
              .
            </p>
          )}
          {pipeline.stale.length === 0 && (
            <p className="text-xs text-muted-foreground">Nothing stale — the pipeline is moving.</p>
          )}
        </div>
      )}
    </Card>
  );
}

function BuildsCard({ builds }: { builds: BuildQueueSection }) {
  return (
    <Card title="Build Queue" icon={Boxes} count={builds.total} testId="builds">
      {builds.inProgress.length === 0 ? (
        <EmptyLine>No builds in progress — the queue is clear.</EmptyLine>
      ) : (
        <ul className="flex flex-col gap-2">
          {builds.inProgress.map((flag) => (
            <li
              key={flag.businessId}
              className="rounded-xl border border-border/60 bg-background/40 px-4 py-2.5"
              data-build-flag
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={flag.link} className="text-sm font-medium hover:text-sky-300">
                  {flag.businessName}
                </Link>
                <span className="text-[11px] text-muted-foreground">
                  {flag.inProgressCount} in progress
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {flag.stalled.map((item) => (
                  <span
                    key={`stalled-${item.kind}`}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-300"
                    data-build-stalled
                  >
                    <Clock className="size-3" />
                    {item.kind} · stalled {item.daysStalled}d
                  </span>
                ))}
                {flag.reviewWaiting.map((kind) => (
                  <span
                    key={`review-${kind}`}
                    className="inline-flex items-center gap-1 rounded-full border border-sky-400/40 bg-sky-400/10 px-2 py-0.5 text-[10px] text-sky-300"
                    data-build-review
                  >
                    <ClipboardCheck className="size-3" />
                    {kind} · your review
                  </span>
                ))}
                {flag.stalled.length === 0 && flag.reviewWaiting.length === 0 && (
                  <span className="text-[11px] text-muted-foreground">on track</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function MoveBadge({ account }: { account: AccountSummary }) {
  if (account.notableMove === null || account.visitDeltaPercent === null) return null;
  const up = account.notableMove === "up";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
        up
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
          : "border-rose-400/40 bg-rose-400/10 text-rose-300"
      }`}
      data-notable-move={account.notableMove}
    >
      {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {account.visitDeltaPercent > 0 ? "+" : ""}
      {account.visitDeltaPercent}% visits
    </span>
  );
}

function AccountsCard({ accounts }: { accounts: AccountSummary[] }) {
  return (
    <Card title="Live accounts" icon={LineChart} count={accounts.length} testId="accounts">
      {accounts.length === 0 ? (
        <EmptyLine>No live accounts yet — sites appear here once a website goes live.</EmptyLine>
      ) : (
        <ul className="flex flex-col gap-2">
          {accounts.map((account) => (
            <li
              key={account.businessId}
              className="rounded-xl border border-border/60 bg-background/40 px-4 py-3"
              data-account={account.businessId}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={account.link} className="flex items-center gap-2 text-sm font-medium hover:text-sky-300">
                  <Radio className="size-3.5 text-emerald-400" />
                  {account.businessName}
                </Link>
                <MoveBadge account={account} />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-base font-semibold tabular-nums" data-account-visits>
                    {account.visits}
                  </p>
                  <p className="text-[10px] text-muted-foreground">visits</p>
                </div>
                <div>
                  <p className="text-base font-semibold tabular-nums">{account.enquiries}</p>
                  <p className="text-[10px] text-muted-foreground">enquiries</p>
                </div>
                <div>
                  <p className="text-base font-semibold tabular-nums">
                    {account.conversionPercent !== null ? `${account.conversionPercent}%` : "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">conversion</p>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">{account.provenance}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function BriefingSections({ briefing }: { briefing: Briefing }) {
  return (
    <>
      {/* Today's top actions — Decision Engine driven (ADR-050). */}
      <Recommendations />
      <div className="grid gap-4 lg:grid-cols-2">
        <EnquiriesCard enquiries={briefing.enquiriesNeedingAttention} />
        <PipelineCard pipeline={briefing.pipeline} />
        <BuildsCard builds={briefing.buildQueue} />
        <AccountsCard accounts={briefing.accounts} />
      </div>
    </>
  );
}

export async function MissionControlPage() {
  const briefing = await resolveBriefing();
  const generated = new Date(briefing.generatedAt);
  const dateLabel = generated.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeLabel = generated.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-6" data-mission-control>
      <header className="flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-sky-300/80">
          <BrainCircuit className="size-3.5" />
          TITAN Brain · Mission Control
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Daily briefing</h1>
        <p className="text-sm text-muted-foreground">
          {dateLabel} · {timeLabel} — live from your CRM and first-party
          measurement. Every figure is measured; nothing here is invented.
        </p>
      </header>

      {briefing.isEmpty ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border/60 bg-card/40 p-8">
          <p className="text-sm text-muted-foreground">
            Mission Control lights up as soon as you have a business. Nothing to
            brief on yet — this is honest absence, not an error.
          </p>
          <Link
            href="/business-intake"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/20 px-3 py-1.5 text-sm hover:border-foreground/30"
          >
            Add a business in Intake
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      ) : (
        <BriefingSections briefing={briefing} />
      )}
    </div>
  );
}
