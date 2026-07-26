/**
 * Command Centre — Business Health chip mappers (ADR-057).
 *
 * Each chip is one measured figure with verbatim provenance and a click-through
 * to its Operations page. Where the figure is structurally unmeasured (revenue
 * today) the mapper returns a crafted-absence chip — value "—", the honest
 * sentence, the same provenance discipline — never a fake zero and never a
 * hidden section.
 */

import type { CommandCentreFacts } from "./facts";

export interface HealthChip {
  key: string;
  label: string;
  /** The measured figure, already formatted — or "—" for crafted absence. */
  value: string;
  /** One short qualifier under the value. */
  sub: string;
  href: string;
  /** Gold marks opportunity/approval accents only (Law: gold is earned). */
  gold: boolean;
  /** True when this chip renders the honest-absence state. */
  empty: boolean;
  /** Verbatim provenance lines for the ⓘ / hover. */
  provenance: readonly string[];
}

export function buildHealthChips(facts: CommandCentreFacts): HealthChip[] {
  const chips: HealthChip[] = [];

  chips.push({
    key: "live-accounts",
    label: "Live accounts",
    value: String(facts.liveAccounts),
    sub: `of ${facts.bookSize} in the book`,
    href: "/businesses",
    gold: false,
    empty: facts.liveAccounts === 0,
    provenance: [
      "count: businesses where stage = live and internal = false",
      `book: businesses where internal = false (${facts.bookSize})`,
      "internal/test rows are excluded at the memory-spine choke point (ADR-056 §7)",
    ],
  });

  chips.push({
    key: "new-this-month",
    label: "New this month",
    value: String(facts.newThisMonth),
    sub: facts.newThisMonth === 0 ? "none yet this month" : "joined the book",
    href: "/crm",
    gold: false,
    empty: facts.newThisMonth === 0,
    provenance: [
      "count: businesses where internal = false, created in the current calendar month",
    ],
  });

  if (facts.revenue === null) {
    chips.push({
      key: "revenue",
      label: "Revenue",
      value: "—",
      sub: "Measurement begins with your first live campaign.",
      href: "/crm",
      gold: false,
      empty: true,
      provenance: [
        "no revenue store exists yet — nothing is measured, so nothing is shown",
        "this chip becomes today / week / month the day a real payment is recorded",
      ],
    });
  } else {
    chips.push(
      {
        key: "revenue-today",
        label: "Revenue today",
        value: formatGbp(facts.revenue.today),
        sub: "measured, first-party",
        href: "/crm",
        gold: true,
        empty: false,
        provenance: ["sum: recorded payments dated today"],
      },
      {
        key: "revenue-week",
        label: "This week",
        value: formatGbp(facts.revenue.week),
        sub: "measured, first-party",
        href: "/crm",
        gold: false,
        empty: false,
        provenance: ["sum: recorded payments, last 7 days"],
      },
      {
        key: "revenue-month",
        label: "This month",
        value: formatGbp(facts.revenue.month),
        sub: "measured, first-party",
        href: "/crm",
        gold: false,
        empty: false,
        provenance: ["sum: recorded payments, current calendar month"],
      },
    );
  }

  const scored = facts.departments.filter((d) => d.band !== null);
  const bands = {
    green: scored.filter((d) => d.band === "green").length,
    amber: scored.filter((d) => d.band === "amber").length,
    red: scored.filter((d) => d.band === "red").length,
  };
  const unscoreable = facts.departments.length - scored.length;
  const bandParts = [
    bands.green > 0 ? `${bands.green} green` : null,
    bands.amber > 0 ? `${bands.amber} amber` : null,
    bands.red > 0 ? `${bands.red} red` : null,
    unscoreable > 0 ? `${unscoreable} not yet scoreable` : null,
  ].filter((part): part is string => part !== null);

  chips.push({
    key: "departments",
    label: "AI departments",
    value: String(facts.departments.length),
    sub: bandParts.length > 0 ? bandParts.join(" · ") : "not yet scoreable",
    href: "/brain",
    gold: false,
    empty: facts.departments.length === 0,
    provenance: [
      "the health engine's computed departments — scored where data exists,",
      "honestly unscoreable (with the reason) where it does not (ADR-051)",
    ],
  });

  return chips;
}

function formatGbp(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}
