import Link from "next/link";
import { ArrowRight, Eye, Globe, Inbox, Mail, Radio, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  averageResponseTimeMs,
  buildItemLabel,
  formatResponseTime,
  resolveBusinessSpine,
  responseTimeMs,
  type Build,
  type Business,
  type Enquiry,
  type EnquiryStatus,
  type SiteMetricRow,
} from "@/core/business";
import {
  markEnquiry,
  moveBusinessStage,
  saveOwnerEmail,
  unpublishBusinessSite,
} from "../api/actions";
import { ActivityLog, CrmChrome, StageBadge } from "./crm-atoms";

/**
 * Level 3 — live customer accounts (ADR-024). The live campaign bundle per
 * business, its activity, the speed-to-lead enquiry inbox, and REAL
 * first-party performance numbers (ADR-030). HONESTY RULE: empty states are
 * designed, numbers are never faked, every figure names its source.
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

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  new: "border-emerald-400/40 bg-emerald-400/15 text-emerald-300",
  seen: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  contacted: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  qualified: "border-emerald-400/30 bg-emerald-400/5 text-emerald-400",
  disqualified: "border-border/60 bg-muted/20 text-muted-foreground",
};

function EnquiryActions({ enquiry }: { enquiry: Enquiry }) {
  const next: Array<{ status: "contacted" | "qualified" | "disqualified"; label: string }> =
    enquiry.status === "new" || enquiry.status === "seen"
      ? [{ status: "contacted", label: "Mark contacted" }]
      : enquiry.status === "contacted"
        ? [
            { status: "qualified", label: "Qualified" },
            { status: "disqualified", label: "Not a fit" },
          ]
        : [];
  if (next.length === 0) return null;
  return (
    <span className="flex items-center gap-1.5">
      {next.map((action) => (
        <form
          key={action.status}
          action={async () => {
            "use server";
            await markEnquiry(enquiry.id, action.status);
          }}
        >
          <Button
            size="sm"
            variant={action.status === "contacted" ? "default" : "outline"}
            type="submit"
            data-enquiry-action={action.status}
          >
            {action.label}
          </Button>
        </form>
      ))}
    </span>
  );
}

function EnquiriesPanel({
  enquiries,
  highlightId,
}: {
  enquiries: Enquiry[];
  highlightId?: string;
}) {
  const average = averageResponseTimeMs(enquiries);
  return (
    <div className="flex flex-col gap-2" data-enquiries-panel>
      <h3 className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Inbox className="size-3.5" />
        Enquiries ({enquiries.length})
        {average !== null && (
          <span
            className="ml-2 inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] normal-case tracking-normal text-amber-300"
            data-avg-response
          >
            <Timer className="size-3" />
            avg response {formatResponseTime(average)}
          </span>
        )}
      </h3>
      {enquiries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
          None yet — enquiries from the live site land here, newest first.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {enquiries.slice(0, 8).map((enquiry) => {
            const response = responseTimeMs(enquiry);
            const highlighted = enquiry.id === highlightId;
            return (
              <li
                key={enquiry.id}
                id={`enquiry-${enquiry.id}`}
                className={`rounded-xl border px-4 py-3 ${
                  highlighted
                    ? "border-emerald-400/60 bg-emerald-400/5 ring-1 ring-emerald-400/40"
                    : "border-border/60 bg-background/40"
                }`}
                data-enquiry={enquiry.status}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <span
                      className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[enquiry.status]}`}
                    >
                      {enquiry.status}
                    </span>
                    {enquiry.name}
                    <span className="font-normal text-muted-foreground">
                      {enquiry.contact}
                    </span>
                    {response !== null && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/20 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        data-response-time
                      >
                        <Timer className="size-3" />
                        {formatResponseTime(response)}
                      </span>
                    )}
                  </p>
                  <span className="flex items-center gap-3">
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(enquiry.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · from {enquiry.sourcePage}
                    </span>
                    <EnquiryActions enquiry={enquiry} />
                  </span>
                </div>
                {enquiry.message && (
                  <p className="mt-1 text-sm text-foreground/85">“{enquiry.message}”</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Real first-party numbers (ADR-030) — or the honest empty state. */
function PerformancePanel({
  metrics,
  enquiries,
}: {
  metrics: SiteMetricRow[];
  enquiries: Enquiry[];
}) {
  const totals = metrics.reduce(
    (sum, row) => ({
      views: sum.views + row.views,
      submits: sum.submits + row.formSubmits,
    }),
    { views: 0, submits: 0 },
  );
  const byPath = new Map<string, { views: number; submits: number }>();
  for (const row of metrics) {
    const entry = byPath.get(row.path) ?? { views: 0, submits: 0 };
    entry.views += row.views;
    entry.submits += row.formSubmits;
    byPath.set(row.path, entry);
  }
  const topPages = [...byPath.entries()]
    .sort((a, b) => b[1].views - a[1].views)
    .slice(0, 4);
  const average = averageResponseTimeMs(enquiries);
  const conversion =
    totals.views > 0 ? ((totals.submits / totals.views) * 100).toFixed(1) : null;

  return (
    <div className="flex flex-col gap-2" data-performance-panel>
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Performance
      </h3>
      {totals.views === 0 && enquiries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
          No visits measured yet — numbers appear as soon as the live site is
          seen. TITAN never shows a number it didn&apos;t measure.
        </p>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/30 p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-2xl font-semibold" data-metric-visits>{totals.views}</p>
              <p className="text-[11px] text-muted-foreground">visits</p>
            </div>
            <div>
              <p className="text-2xl font-semibold" data-metric-enquiries>{enquiries.length}</p>
              <p className="text-[11px] text-muted-foreground">enquiries</p>
            </div>
            <div>
              <p className="text-2xl font-semibold" data-metric-conversion>
                {conversion !== null ? `${conversion}%` : "—"}
              </p>
              <p className="text-[11px] text-muted-foreground">form conversion</p>
            </div>
            <div>
              <p className="text-2xl font-semibold" data-metric-response>
                {average !== null ? formatResponseTime(average) : "—"}
              </p>
              <p className="text-[11px] text-muted-foreground">avg response</p>
            </div>
          </div>
          {topPages.length > 0 && (
            <div className="flex flex-col gap-1 border-t border-border/60 pt-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Top pages
              </p>
              {topPages.map(([path, entry]) => (
                <p key={path} className="flex justify-between text-xs">
                  <span className="font-mono">{path}</span>
                  <span className="text-muted-foreground">
                    {entry.views} visits
                    {entry.views > 0 &&
                      ` · ${((entry.submits / entry.views) * 100).toFixed(1)}% convert`}
                  </span>
                </p>
              ))}
            </div>
          )}
          <p className="text-[10px] text-muted-foreground">
            Measured first-party by TITAN on the live site — daily aggregates,
            no cookies, no third-party trackers.
          </p>
        </div>
      )}
    </div>
  );
}

async function AccountCard({
  business,
  highlightEnquiryId,
}: {
  business: Business;
  highlightEnquiryId?: string;
}) {
  const spine = await resolveBusinessSpine();
  const [build, entries, publication, enquiries, metrics] = await Promise.all([
    spine.builds.getForBusiness(business.id),
    spine.activity.list(business.id),
    spine.publications.current(business.id),
    spine.enquiries.listForBusiness(business.id),
    spine.metrics.listForBusiness(business.id),
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
          {publication ? (
            <Button
              size="sm"
              render={
                <Link href={`/sites/${publication.slug}`} target="_blank" />
              }
              className="gap-1.5"
              data-live-site-link
            >
              <Globe className="size-3.5" />
              /sites/{publication.slug} · v{publication.version}
            </Button>
          ) : (
            <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/20 px-2.5 py-0.5 text-[11px] text-muted-foreground">
              site offline
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            render={
              <Link href={`/experience-studio/preview?businessId=${business.id}`} />
            }
            className="gap-1.5"
          >
            <Eye className="size-3.5" />
            Preview
          </Button>
          {publication && (
            <form
              action={async () => {
                "use server";
                await unpublishBusinessSite(business.id);
              }}
            >
              <Button size="sm" variant="ghost" type="submit">
                Unpublish
              </Button>
            </form>
          )}
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

      <EnquiriesPanel enquiries={enquiries} highlightId={highlightEnquiryId} />

      <PerformancePanel metrics={metrics} enquiries={enquiries} />

      {/* Where enquiry notifications for this account are sent (ADR-030). */}
      <form
        action={async (formData: FormData) => {
          "use server";
          await saveOwnerEmail(business.id, String(formData.get("ownerEmail") ?? ""));
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <Mail className="size-3.5 text-muted-foreground" />
        <Input
          name="ownerEmail"
          type="email"
          defaultValue={business.ownerEmail ?? ""}
          key={business.ownerEmail ?? "unset"}
          placeholder="owner@business.example — enquiry notifications"
          className="h-8 max-w-xs text-xs"
          aria-label="Owner notification email"
        />
        <Button size="sm" variant="outline" type="submit">
          Save
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Recent activity
        </h3>
        <ActivityLog entries={entries.slice(0, 5)} />
      </div>
    </section>
  );
}

export async function CrmAccountsPage({
  highlightEnquiryId,
}: {
  highlightEnquiryId?: string;
} = {}) {
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
            <AccountCard
              key={business.id}
              business={business}
              highlightEnquiryId={highlightEnquiryId}
            />
          ))}
        </div>
      )}
    </CrmChrome>
  );
}
