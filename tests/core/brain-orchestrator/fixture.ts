import type { Business, MediaRecord, Publication } from "@/core/business";
import { buildKnowledgeGraph, type KnowledgeGraph, type MemorySnapshot } from "@/core/memory-spine";

/**
 * Decision Engine fixture (ADR-050): one deterministic snapshot in which each
 * of the six rules has exactly one honest reason to fire — plus the makings
 * of the Activation Law (empty) and suppression tests. Fixed clock.
 */

export const NOW = "2026-07-20T12:00:00.000Z";

/** Explicit thresholds so tests never depend on config defaults. */
export const THRESHOLDS = {
  enquirySlaMinutes: 15,
  dealStaleDays: 5,
  buildStaleDays: 3,
  accountPeriodDays: 7,
  notableMovePercent: 30,
};

function business(
  partial: Partial<Business> & Pick<Business, "id" | "name" | "trade" | "stage">,
): Business {
  return {
    location: "Leeds",
    stageHistory: [{ stage: "lead", enteredAt: "2026-06-01T09:00:00.000Z" }],
    createdAt: "2026-06-01T09:00:00.000Z",
    updatedAt: "2026-06-01T09:00:00.000Z",
    ...partial,
  };
}

/** Live roofing account: SLA breach + measurement drop + media in review. */
export const roofing = business({
  id: "b-roof",
  name: "Rapid Roofing",
  trade: "Emergency Roofing", // banked trade — missing_content must NOT fire
  stage: "live",
});

/** Proposal that has sat still for 10 days. */
export const slowDeal = business({
  id: "b-deal",
  name: "Slow Deal Co",
  trade: "Driveways & Paving",
  stage: "proposed",
  stageHistory: [
    { stage: "lead", enteredAt: "2026-06-20T09:00:00.000Z" },
    { stage: "proposed", enteredAt: "2026-07-10T09:00:00.000Z" }, // 10 days ago
  ],
});

/** Build with one item on the founder gate and one stalled. */
export const buildingCo = business({
  id: "b-build",
  name: "Building Co",
  trade: "Dentistry",
  stage: "building",
});

/** Live site whose trade has NO researched FAQ bank. */
export const signs = business({
  id: "b-signs",
  name: "Northern Signs",
  trade: "Signwriting",
  stage: "live",
});

export const roofingSite: Publication = {
  id: "pub-roof",
  businessId: "b-roof",
  slug: "rapid-roofing",
  version: 1,
  blueprintVersion: 1,
  status: "live",
  createdAt: "2026-06-15T10:00:00.000Z",
  statusChangedAt: "2026-06-15T10:00:00.000Z",
};

export const signsSite: Publication = {
  id: "pub-signs",
  businessId: "b-signs",
  slug: "northern-signs",
  version: 1,
  blueprintVersion: 1,
  status: "live",
  createdAt: "2026-06-15T10:00:00.000Z",
  statusChangedAt: "2026-06-15T10:00:00.000Z",
};

export const mediaInReview: MediaRecord = {
  id: "media-review-1",
  businessId: "b-roof",
  slotRef: "hero.backdrop",
  brief: "Storm-lit rooftop",
  modality: "image",
  url: "https://storage.example/m1.jpg",
  status: "review",
  provenance: {
    provider: "replicate",
    model: "img",
    prompt: "roof",
    costUsd: 0.02,
    generatedAt: "2026-07-19T09:00:00.000Z",
  },
  createdAt: "2026-07-19T09:00:00.000Z",
};

export function fixtureSnapshot(): MemorySnapshot {
  return {
    businesses: [roofing, slowDeal, buildingCo, signs],
    enquiries: [
      {
        id: "e-breach",
        businessId: "b-roof",
        publicationId: "pub-roof",
        name: "Dana Homeowner",
        contact: "dana@example.com",
        message: "Water coming through the ceiling",
        sourcePage: "/",
        createdAt: "2026-07-20T10:30:00.000Z", // 90 min before NOW; SLA 15
        status: "new",
      },
      {
        id: "e-handled",
        businessId: "b-roof",
        publicationId: "pub-roof",
        name: "Sam Sorted",
        contact: "sam@example.com",
        message: "Gutter quote please",
        sourcePage: "/",
        createdAt: "2026-07-20T09:00:00.000Z",
        status: "contacted", // handled — must NOT fire
        seenAt: "2026-07-20T09:05:00.000Z",
        contactedAt: "2026-07-20T09:10:00.000Z",
      },
    ],
    deals: [],
    campaigns: [],
    builds: [
      {
        id: "build-1",
        businessId: "b-build",
        createdAt: "2026-07-01T09:00:00.000Z",
        items: [
          {
            id: "i-web",
            buildId: "build-1",
            kind: "website",
            status: "review", // founder gate
            manual: false,
            updatedAt: "2026-07-19T09:00:00.000Z",
          },
          {
            id: "i-ads",
            buildId: "build-1",
            kind: "google_ads",
            status: "building", // stalled 5 days (threshold 3)
            manual: true,
            updatedAt: "2026-07-15T09:00:00.000Z",
          },
          {
            id: "i-seo",
            buildId: "build-1",
            kind: "seo",
            status: "queued", // neither — must not be reported
            manual: true,
            updatedAt: "2026-07-15T09:00:00.000Z",
          },
        ],
      },
    ],
    publications: [roofingSite, signsSite],
    metrics: [
      // Current 7-day window (13th–19th): 10 views — a 75% drop.
      { businessId: "b-roof", path: "/", date: "2026-07-15", views: 6, formStarts: 1, formSubmits: 0 },
      { businessId: "b-roof", path: "/", date: "2026-07-18", views: 4, formStarts: 0, formSubmits: 0 },
      // Prior window (6th–12th): 40 views.
      { businessId: "b-roof", path: "/", date: "2026-07-08", views: 25, formStarts: 3, formSubmits: 2 },
      { businessId: "b-roof", path: "/", date: "2026-07-11", views: 15, formStarts: 2, formSubmits: 1 },
    ],
    media: [mediaInReview],
    activity: [],
    markets: [],
  };
}

export function fixtureGraph(): KnowledgeGraph {
  return buildKnowledgeGraph(fixtureSnapshot());
}

export function emptyGraph(): KnowledgeGraph {
  return buildKnowledgeGraph({
    businesses: [],
    enquiries: [],
    deals: [],
    campaigns: [],
    builds: [],
    publications: [],
    metrics: [],
    media: [],
    activity: [],
    markets: [],
  });
}
