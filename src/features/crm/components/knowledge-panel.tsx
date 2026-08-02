import { BookOpen } from "lucide-react";
import {
  DNA_SECTION_KEYS,
  resolveIndustryDna,
  type DnaList,
  type DnaSectionKey,
} from "@/core/industry-dna";

/**
 * Industry knowledge in the founder's hand while he sells (queue item 2's
 * whole point). Renders the trade's Industry DNA beside the pitch panel:
 * legal MUSTs first — they are simultaneously the selling ammunition and
 * the things TITAN must never fake — then the customer's head, then how
 * the site converts, then the market.
 *
 * Honesty on the surface itself: the coverage line states how many of the
 * twelve sections carry trade-specific research, an unmatched trade says
 * so instead of borrowing a neighbour's facts, and every fact on screen
 * traces to the research dossiers listed in the Sources fold.
 */

function Entries({ list }: { list: DnaList }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {list.map((entry) => (
        <li key={entry.label} className="flex flex-col gap-0.5">
          <span className="flex flex-wrap items-baseline gap-2 text-sm text-foreground/90">
            <span className="flex gap-2">
              <span className="mt-[7px] size-1 shrink-0 rounded-full bg-emerald-400/70" />
              {entry.label}
            </span>
            {entry.value !== undefined && (
              <span className="rounded-md border border-emerald-400/25 bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[11px] text-emerald-200">
                {entry.value}
              </span>
            )}
          </span>
          {entry.description && (
            <span className="pl-3 text-xs leading-relaxed text-muted-foreground">
              {entry.description}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function Block({
  title,
  lists,
}: {
  title: string;
  lists: ReadonlyArray<DnaList | undefined>;
}) {
  const present = lists.filter(
    (list): list is DnaList => Array.isArray(list) && list.length > 0,
  );
  if (present.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-col gap-2.5">
        {present.map((list, index) => (
          <Entries key={index} list={list} />
        ))}
      </div>
    </div>
  );
}

const SECTION_LABELS: Record<DnaSectionKey, string> = {
  businessIdentity: "identity",
  services: "services",
  customerPsychology: "psychology",
  website: "website",
  searchSeo: "search",
  paidAdvertising: "advertising",
  brand: "brand",
  sales: "sales",
  marketIntelligence: "market",
  operations: "operations",
  businessIntelligence: "business intelligence",
  aiBehaviour: "publish gates",
};

export function KnowledgePanel({
  trade,
  tradeId,
}: {
  trade: string;
  tradeId?: string;
}) {
  const { dna, matched, tradeSections } = resolveIndustryDna(tradeId ?? trade);

  // Every source behind what is rendered, deduplicated, dossier paths only.
  const sources = [
    ...new Set(
      DNA_SECTION_KEYS.flatMap(
        (key) => (dna[key].extensions?.sources as string[] | undefined) ?? [],
      ),
    ),
  ];

  return (
    <section
      aria-label="Industry knowledge"
      className="flex flex-col gap-5 rounded-2xl border border-emerald-400/20 bg-card/40 p-5"
      data-knowledge-panel
    >
      <header className="flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
          <BookOpen className="size-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">Industry knowledge</h2>
          <p className="text-[11px] text-muted-foreground">
            {matched
              ? `${tradeSections.length} of 12 sections researched for this trade · sourced from the TITAN dossiers`
              : "No trade-specific record matched — platform-wide knowledge only, no borrowed facts"}
          </p>
        </div>
      </header>

      <Block
        title="Legal MUSTs · certifications · guarantees"
        lists={[
          dna.operations.certifications,
          dna.operations.serviceGuarantees,
          dna.aiBehaviour.automationRules,
        ]}
      />

      <Block
        title="The customer's head"
        lists={[
          dna.customerPsychology.fears,
          dna.customerPsychology.buyingTriggers,
          dna.customerPsychology.customerMotivations,
          dna.customerPsychology.trustFactors,
          dna.customerPsychology.objections,
        ]}
      />

      <Block
        title="How the site converts"
        lists={[
          dna.website.forms,
          dna.website.callsToAction,
          dna.website.conversionStrategy,
          dna.website.trustSignals,
          dna.website.siteStructure,
          dna.website.landingPages,
        ]}
      />

      <Block
        title="Market · pricing · season"
        lists={[
          dna.marketIntelligence.competitors,
          dna.marketIntelligence.pricingPosition,
          dna.marketIntelligence.seasonalTrends,
          dna.marketIntelligence.economicFactors,
          dna.marketIntelligence.industryTrends,
        ]}
      />

      <Block
        title="Services & search"
        lists={[
          dna.services.serviceCategories,
          dna.services.individualServices,
          dna.services.emergencyServices,
          dna.services.premiumServices,
          dna.services.upsells,
          dna.searchSeo.locationPages,
          dna.searchSeo.contentStrategy,
          dna.searchSeo.googleBusinessProfile,
        ]}
      />

      {matched && (
        <p className="text-[11px] text-muted-foreground">
          Trade-specific sections:{" "}
          {tradeSections.map((key) => SECTION_LABELS[key]).join(" · ")}
        </p>
      )}

      {sources.length > 0 && (
        <details className="rounded-xl border border-border/60 bg-background/40 px-4 py-3">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
            Sources ({sources.length})
          </summary>
          <ul className="mt-2 flex flex-col gap-1">
            {sources.map((source) => (
              <li key={source} className="font-mono text-[11px] text-muted-foreground">
                {source}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
