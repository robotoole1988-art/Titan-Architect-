import { describe, expect, it } from "vitest";
import {
  buildBriefing,
  DEFAULT_THRESHOLDS,
  type MissionControlData,
} from "@/core/mission-control";
import type {
  Build,
  BuildItem,
  BuildItemKind,
  BuildItemStatus,
  Business,
  Enquiry,
  EnquiryStatus,
  Publication,
  SiteMetricRow,
} from "@/core/business";

/**
 * Mission Control (ADR-042) — the deterministic briefing engine. Pure over a
 * plain snapshot + an explicit `now` + one thresholds config: every rule is
 * unit-testable, every run reproducible. No number is invented; each traces to
 * its source.
 */

const NOW = "2026-07-06T12:00:00.000Z";
const DAY = 86_400_000;
const MIN = 60_000;

function ago(ms: number): string {
  return new Date(Date.parse(NOW) - ms).toISOString();
}
function dateAgo(days: number): string {
  return new Date(Date.parse(NOW) - days * DAY).toISOString().slice(0, 10);
}

function business(over: Partial<Business> & { id: string }): Business {
  const created = over.createdAt ?? ago(30 * DAY);
  return {
    name: `Biz ${over.id}`,
    trade: "Roofing",
    location: "Leeds",
    stage: "lead",
    stageHistory: over.stageHistory ?? [{ stage: over.stage ?? "lead", enteredAt: created }],
    createdAt: created,
    updatedAt: over.updatedAt ?? created,
    ...over,
  };
}

function enquiry(over: Partial<Enquiry> & { id: string; businessId: string }): Enquiry {
  return {
    publicationId: "pub-1",
    name: `Lead ${over.id}`,
    contact: "lead@example.com",
    message: "Need help",
    sourcePage: "/",
    createdAt: over.createdAt ?? ago(10 * MIN),
    status: (over.status ?? "new") as EnquiryStatus,
    ...over,
  };
}

function buildItem(kind: BuildItemKind, status: BuildItemStatus, updatedAt: string): BuildItem {
  return { id: `item-${kind}`, buildId: "b1", kind, status, manual: kind !== "website", updatedAt };
}
function build(over: Partial<Build> & { id: string; businessId: string; items: BuildItem[] }): Build {
  return { createdAt: ago(20 * DAY), ...over };
}

function publication(over: Partial<Publication> & { id: string; businessId: string; slug: string }): Publication {
  return {
    version: 1,
    blueprintVersion: 1,
    status: "live",
    createdAt: ago(20 * DAY),
    statusChangedAt: ago(20 * DAY),
    ...over,
  };
}

function metric(over: Partial<SiteMetricRow> & { businessId: string; date: string }): SiteMetricRow {
  return { path: "/", views: 0, formStarts: 0, formSubmits: 0, ...over };
}

const EMPTY: MissionControlData = {
  businesses: [],
  enquiries: [],
  builds: [],
  publications: [],
  metrics: [],
};

function briefing(data: Partial<MissionControlData>) {
  return buildBriefing(
    { ...EMPTY, ...data },
    { now: NOW, thresholds: DEFAULT_THRESHOLDS },
  );
}

describe("empty briefing — honest absence, no invented figures", () => {
  it("reports empty with all sections empty when there is no data", () => {
    const b = briefing({});
    expect(b.isEmpty).toBe(true);
    expect(b.enquiriesNeedingAttention).toEqual([]);
    expect(b.pipeline.total).toBe(0);
    expect(b.buildQueue.inProgress).toEqual([]);
    expect(b.accounts).toEqual([]);
    expect(b.topActions).toEqual([]);
    expect(b.generatedAt).toBe(NOW);
  });
});

describe("enquiries needing attention — speed-to-lead SLA", () => {
  const biz = business({ id: "biz-1", stage: "live" });

  it("lists uncontacted enquiries oldest first, flags past-SLA with minutes", () => {
    const b = briefing({
      businesses: [biz],
      enquiries: [
        enquiry({ id: "e-fresh", businessId: "biz-1", createdAt: ago(10 * MIN) }),
        enquiry({ id: "e-old", businessId: "biz-1", createdAt: ago(180 * MIN) }), // 3h → 2h past a 60m SLA
        enquiry({ id: "e-seen", businessId: "biz-1", status: "seen", createdAt: ago(90 * MIN) }),
      ],
    });
    // Oldest first.
    expect(b.enquiriesNeedingAttention.map((e) => e.enquiryId)).toEqual([
      "e-old",
      "e-seen",
      "e-fresh",
    ]);
    const old = b.enquiriesNeedingAttention[0];
    expect(old.slaBreached).toBe(true);
    expect(old.minutesPastSla).toBe(120);
    expect(old.ageMinutes).toBe(180);
    expect(old.businessName).toBe(biz.name);
    expect(old.link).toBe("/crm/accounts?enquiry=e-old");
    // Fresh enquiry is present but within SLA.
    const fresh = b.enquiriesNeedingAttention.find((e) => e.enquiryId === "e-fresh")!;
    expect(fresh.slaBreached).toBe(false);
    expect(fresh.minutesPastSla).toBe(0);
  });

  it("excludes already-contacted / resolved enquiries — they need no attention", () => {
    const b = briefing({
      businesses: [biz],
      enquiries: [
        enquiry({ id: "e-contacted", businessId: "biz-1", status: "contacted", createdAt: ago(200 * MIN), contactedAt: ago(30 * MIN) }),
        enquiry({ id: "e-qualified", businessId: "biz-1", status: "qualified", createdAt: ago(300 * MIN) }),
        enquiry({ id: "e-disq", businessId: "biz-1", status: "disqualified", createdAt: ago(300 * MIN) }),
      ],
    });
    expect(b.enquiriesNeedingAttention).toEqual([]);
  });
});

describe("pipeline — by stage, staleness, deals needing action", () => {
  it("counts active stages and excludes won/live/lost from the pipeline", () => {
    const b = briefing({
      businesses: [
        business({ id: "l1", stage: "lead" }),
        business({ id: "l2", stage: "lead" }),
        business({ id: "q1", stage: "qualified" }),
        business({ id: "p1", stage: "proposed" }),
        business({ id: "won1", stage: "won" }),
        business({ id: "live1", stage: "live" }),
        business({ id: "lost1", stage: "not_interested" }),
      ],
    });
    expect(b.pipeline.total).toBe(4);
    const byStage = Object.fromEntries(b.pipeline.byStage.map((s) => [s.stage, s.count]));
    expect(byStage).toEqual({ lead: 2, qualified: 1, proposed: 1 });
  });

  it("flags stale pipeline items by last stage movement", () => {
    const fresh = business({
      id: "fresh",
      stage: "qualified",
      stageHistory: [{ stage: "qualified", enteredAt: ago(2 * DAY) }],
    });
    const stale = business({
      id: "stale",
      stage: "qualified",
      stageHistory: [{ stage: "qualified", enteredAt: ago(9 * DAY) }],
    });
    const b = briefing({ businesses: [fresh, stale] });
    expect(b.pipeline.stale.map((s) => s.businessId)).toEqual(["stale"]);
    expect(b.pipeline.stale[0].daysSinceMovement).toBe(9);
    expect(b.pipeline.stale[0].link).toBe("/crm/stale");
  });

  it("surfaces stale PROPOSED businesses as deals needing a next action", () => {
    const staleDeal = business({
      id: "deal",
      stage: "proposed",
      stageHistory: [{ stage: "proposed", enteredAt: ago(8 * DAY) }],
    });
    const freshDeal = business({
      id: "freshdeal",
      stage: "proposed",
      stageHistory: [{ stage: "proposed", enteredAt: ago(1 * DAY) }],
    });
    const b = briefing({ businesses: [staleDeal, freshDeal] });
    expect(b.pipeline.dealsNeedingAction.map((d) => d.businessId)).toEqual(["deal"]);
  });
});

describe("build queue — in progress, review-waiting, stalled", () => {
  it("only surfaces builds with in-progress items; flags review-waiting and stalled", () => {
    const inProgress = build({
      id: "b-live-biz",
      businessId: "biz-inprog",
      items: [
        buildItem("website", "review", ago(1 * DAY)), // waiting on founder review
        buildItem("seo", "building", ago(5 * DAY)), // stalled (> 3 days)
        buildItem("gbp", "live", ago(10 * DAY)), // done — not in progress
      ],
    });
    const allLive = build({
      id: "b-done",
      businessId: "biz-done",
      items: [buildItem("website", "live", ago(2 * DAY))],
    });
    const b = briefing({
      businesses: [
        business({ id: "biz-inprog", stage: "building" }),
        business({ id: "biz-done", stage: "account" }),
      ],
      builds: [inProgress, allLive],
    });
    expect(b.buildQueue.inProgress.map((x) => x.businessId)).toEqual(["biz-inprog"]);
    const flag = b.buildQueue.inProgress[0];
    expect(flag.reviewWaiting).toEqual(["website"]);
    expect(flag.stalled.map((s) => s.kind)).toEqual(["seo"]);
    expect(flag.stalled[0].daysStalled).toBe(5);
    expect(flag.inProgressCount).toBe(2);
    expect(flag.link).toBe("/crm/build-queue");
  });
});

describe("live accounts — first-party measurement + period moves + provenance", () => {
  const biz = business({ id: "acct", stage: "live" });
  const pub = publication({ id: "pub-acct", businessId: "acct", slug: "acme-roofing" });

  it("computes visits, enquiries and conversion from real rows, with provenance", () => {
    const b = briefing({
      businesses: [biz],
      publications: [pub],
      enquiries: [enquiry({ id: "e1", businessId: "acct", status: "contacted", createdAt: ago(2 * DAY), contactedAt: ago(2 * DAY) })],
      metrics: [
        metric({ businessId: "acct", date: dateAgo(1), views: 80, formSubmits: 4 }),
        metric({ businessId: "acct", date: dateAgo(2), views: 20, formSubmits: 1 }),
      ],
    });
    const acct = b.accounts[0];
    expect(acct.slug).toBe("acme-roofing");
    expect(acct.visits).toBe(100);
    expect(acct.enquiries).toBe(1);
    expect(acct.conversionPercent).toBeCloseTo(5, 5); // 5 submits / 100 views
    expect(acct.provenance).toMatch(/first-party/i);
    expect(acct.link).toBe("/crm/accounts");
  });

  it("conversion is null (never invented) when there are no measured visits", () => {
    const b = briefing({ businesses: [biz], publications: [pub], metrics: [] });
    expect(b.accounts[0].visits).toBe(0);
    expect(b.accounts[0].conversionPercent).toBeNull();
    expect(b.accounts[0].visitDeltaPercent).toBeNull();
    expect(b.accounts[0].notableMove).toBeNull();
  });

  it("flags a notable move vs the prior period", () => {
    const b = briefing({
      businesses: [biz],
      publications: [pub],
      metrics: [
        // current 7-day window: 200 views
        metric({ businessId: "acct", date: dateAgo(1), views: 200 }),
        // prior 7-day window: 100 views → +100%, well past the ±25% threshold
        metric({ businessId: "acct", date: dateAgo(9), views: 100 }),
      ],
    });
    const acct = b.accounts[0];
    expect(acct.periodVisits).toBe(200);
    expect(acct.priorVisits).toBe(100);
    expect(acct.visitDeltaPercent).toBe(100);
    expect(acct.notableMove).toBe("up");
  });

  it("only includes LIVE published sites", () => {
    const b = briefing({
      businesses: [biz, business({ id: "off", stage: "account" })],
      publications: [pub, publication({ id: "p-off", businessId: "off", slug: "off", status: "unpublished" })],
    });
    expect(b.accounts.map((a) => a.businessId)).toEqual(["acct"]);
  });
});

describe("today's top actions — deterministic ranking", () => {
  it("ranks an SLA-breached enquiry above a stale deal, with full guidance + link", () => {
    const b = briefing({
      businesses: [
        business({ id: "biz-e", stage: "live" }),
        business({ id: "biz-d", stage: "proposed", stageHistory: [{ stage: "proposed", enteredAt: ago(9 * DAY) }] }),
      ],
      enquiries: [enquiry({ id: "e-late", businessId: "biz-e", createdAt: ago(240 * MIN) })],
    });
    expect(b.topActions.length).toBeGreaterThanOrEqual(2);
    expect(b.topActions[0].kind).toBe("enquiry_sla");
    expect(b.topActions[0].link).toBe("/crm/accounts?enquiry=e-late");
    const dealAction = b.topActions.find((a) => a.kind === "deal_stale")!;
    expect(b.topActions[0].score).toBeGreaterThan(dealAction.score);
    for (const action of b.topActions) {
      expect(action.what).toBeTruthy();
      expect(action.why).toBeTruthy();
      expect(action.recommendedAction).toBeTruthy();
      expect(action.link).toMatch(/^\/crm\//);
    }
  });

  it("caps the shortlist at the configured limit and is fully deterministic", () => {
    const businesses: Business[] = [];
    const enquiries: Enquiry[] = [];
    for (let i = 0; i < 12; i++) {
      businesses.push(business({ id: `b${i}`, stage: "live" }));
      enquiries.push(
        enquiry({ id: `e${i}`, businessId: `b${i}`, createdAt: ago((120 + i * 10) * MIN) }),
      );
    }
    const first = buildBriefing({ ...EMPTY, businesses, enquiries }, { now: NOW });
    const again = buildBriefing({ ...EMPTY, businesses, enquiries }, { now: NOW });
    expect(first.topActions.length).toBe(DEFAULT_THRESHOLDS.topActionsLimit);
    expect(JSON.stringify(first)).toBe(JSON.stringify(again));
    // Descending by score — a stable ranking.
    const scores = first.topActions.map((a) => a.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });
});
