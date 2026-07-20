import type {
  ActivityEntry,
  ArtifactRecord,
  Build,
  Business,
  Enquiry,
  MediaRecord,
  Publication,
  SiteMetricRow,
} from "@/core/business";
import type { MemorySnapshot } from "@/core/memory-spine";

/**
 * One deterministic fixture snapshot for the memory-spine suite: three
 * businesses at different lifecycle points, with every entity kind present at
 * least once, fixed timestamps, and one deliberately dangling foreign key
 * (an enquiry pointing at a publication that is not in the snapshot) to prove
 * the honesty rule: no edge is fabricated around missing data.
 */

export const NOW = "2026-07-08T12:00:00.000Z";

function business(partial: Partial<Business> & Pick<Business, "id" | "name" | "stage">): Business {
  return {
    trade: "Roofing",
    location: "Leeds",
    stageHistory: [{ stage: "lead", enteredAt: "2026-06-01T09:00:00.000Z" }],
    createdAt: "2026-06-01T09:00:00.000Z",
    updatedAt: "2026-06-01T09:00:00.000Z",
    ...partial,
  };
}

/** Summit: a live account with the full entity constellation. */
export const summit = business({
  id: "b-summit",
  name: "Summit Roofing Rescue",
  trade: "Emergency Roofing & Drainage",
  tradeId: "roofing-repairs-emergency",
  stage: "live",
  contact: { email: "hello@summit.example", phone: "0113 000 0000" },
});

/** Kerbside: a lead that has gone quiet (last touch 8 days before NOW). */
export const kerbside = business({
  id: "b-kerbside",
  name: "Kerbside Kings",
  trade: "Driveways & Paving",
  stage: "lead",
  createdAt: "2026-06-20T09:00:00.000Z",
  updatedAt: "2026-06-30T09:00:00.000Z",
});

/** Bright: a qualified lead touched yesterday (must NOT read as neglected). */
export const bright = business({
  id: "b-bright",
  name: "Bright Smile Dental",
  trade: "Dentistry",
  stage: "qualified",
  createdAt: "2026-06-25T09:00:00.000Z",
  updatedAt: "2026-07-07T09:00:00.000Z",
});

export const livePublication: Publication = {
  id: "pub-summit-2",
  businessId: "b-summit",
  slug: "summit-roofing-rescue",
  version: 2,
  blueprintVersion: 3,
  status: "live",
  createdAt: "2026-07-01T10:00:00.000Z",
  statusChangedAt: "2026-07-01T10:00:00.000Z",
};

export const supersededPublication: Publication = {
  id: "pub-summit-1",
  businessId: "b-summit",
  slug: "summit-roofing-rescue",
  version: 1,
  blueprintVersion: 2,
  status: "superseded",
  createdAt: "2026-06-15T10:00:00.000Z",
  statusChangedAt: "2026-07-01T10:00:00.000Z",
};

export const enquiryNew: Enquiry = {
  id: "enq-1",
  businessId: "b-summit",
  publicationId: "pub-summit-2",
  name: "Jane Homeowner",
  contact: "jane@example.com",
  message: "Storm damage on the ridge line.",
  sourcePage: "/",
  createdAt: "2026-07-08T09:00:00.000Z",
  status: "new",
};

export const enquiryContacted: Enquiry = {
  id: "enq-2",
  businessId: "b-summit",
  publicationId: "pub-summit-2",
  name: "Sam Landlord",
  contact: "07700 900000",
  message: "Three properties need gutter work.",
  sourcePage: "/headingley",
  createdAt: "2026-07-05T15:00:00.000Z",
  status: "contacted",
  seenAt: "2026-07-05T15:10:00.000Z",
  contactedAt: "2026-07-05T15:30:00.000Z",
};

/** HONESTY CASE: points at a publication that is NOT in the snapshot. */
export const enquiryDangling: Enquiry = {
  id: "enq-dangling",
  businessId: "b-summit",
  publicationId: "pub-deleted",
  name: "Ghost",
  contact: "ghost@example.com",
  message: "From a publication record we no longer hold.",
  sourcePage: "/",
  createdAt: "2026-07-02T08:00:00.000Z",
  status: "new",
};

export const summitBuild: Build = {
  id: "build-summit",
  businessId: "b-summit",
  createdAt: "2026-06-10T09:00:00.000Z",
  items: [
    {
      id: "item-website",
      buildId: "build-summit",
      kind: "website",
      status: "review", // waiting on the founder gate
      manual: false,
      updatedAt: "2026-07-07T09:00:00.000Z",
    },
    {
      id: "item-google-ads",
      buildId: "build-summit",
      kind: "google_ads",
      status: "building", // in progress, untouched for 5 days → stalled
      manual: true,
      updatedAt: "2026-07-03T09:00:00.000Z",
    },
    {
      id: "item-seo",
      buildId: "build-summit",
      kind: "seo",
      status: "queued", // queued is neither stalled nor waiting
      manual: true,
      updatedAt: "2026-07-03T09:00:00.000Z",
    },
  ],
};

export const summitDeal: ArtifactRecord = {
  id: "art-deal-summit",
  businessId: "b-summit",
  kind: "deal",
  version: 2,
  payload: { setupFee: 1500, monthly: 400 },
  createdAt: "2026-06-08T09:00:00.000Z",
};

export const summitCampaign: ArtifactRecord = {
  id: "art-campaign-summit",
  businessId: "b-summit",
  kind: "campaign_plan",
  version: 1,
  payload: { budget: 1000 },
  createdAt: "2026-07-02T09:00:00.000Z",
};

export const metricsRows: SiteMetricRow[] = [
  { businessId: "b-summit", path: "/", date: "2026-07-06", views: 42, formStarts: 5, formSubmits: 2 },
  { businessId: "b-summit", path: "/", date: "2026-07-07", views: 51, formStarts: 7, formSubmits: 3 },
  { businessId: "b-summit", path: "/headingley", date: "2026-07-07", views: 12, formStarts: 1, formSubmits: 1 },
];

export const summitMedia: MediaRecord = {
  id: "media-1",
  businessId: "b-summit",
  slotRef: "hero.backdrop",
  brief: "Storm-lit rooftop, cinematic.",
  modality: "image",
  url: "https://storage.example/media-1.jpg",
  status: "approved",
  provenance: {
    provider: "replicate",
    model: "img-model",
    prompt: "storm roof",
    costUsd: 0.02,
    generatedAt: "2026-06-28T09:00:00.000Z",
  },
  createdAt: "2026-06-28T09:00:00.000Z",
};

export const activityEntries: ActivityEntry[] = [
  {
    id: "act-summit-1",
    businessId: "b-summit",
    kind: "publication",
    message: "Published v2",
    createdAt: "2026-07-01T10:00:00.000Z",
  },
  {
    id: "act-kerbside-1",
    businessId: "b-kerbside",
    kind: "note",
    message: "Left a voicemail",
    createdAt: "2026-06-30T09:00:00.000Z", // 8 days before NOW
  },
  {
    id: "act-bright-1",
    businessId: "b-bright",
    kind: "note",
    message: "Called back, wants a proposal",
    createdAt: "2026-07-07T09:00:00.000Z", // 1 day before NOW
  },
];

/** One VERIFIED review (ADR-053) — attestation on file. */
export const summitReview = {
  id: "rev-1",
  businessId: "b-summit",
  customerName: "Priya Patel",
  rating: 5,
  text: "Roof fixed the same day we called — brilliant.",
  reviewedAt: "2026-07-01",
  source: "direct" as const,
  verification: {
    verifiedBy: "founder",
    method: "email from customer on file",
    verifiedAt: "2026-07-02T09:00:00.000Z",
  },
  createdAt: "2026-07-02T09:00:00.000Z",
};

export function fixtureSnapshot(): MemorySnapshot {
  return {
    businesses: [summit, kerbside, bright],
    enquiries: [enquiryNew, enquiryContacted, enquiryDangling],
    deals: [summitDeal],
    campaigns: [summitCampaign],
    builds: [summitBuild],
    publications: [livePublication, supersededPublication],
    metrics: metricsRows,
    media: [summitMedia],
    activity: activityEntries,
    reviews: [summitReview],
    markets: [
      {
        businessId: "b-summit",
        trade: "roofing-repairs-emergency",
        location: "Leeds",
        providerName: "seeded",
        estimate: {
          low: 18,
          mid: 24,
          high: 30,
        } as never,
      },
    ],
  };
}
