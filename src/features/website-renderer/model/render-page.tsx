/**
 * renderPage — the composition function (ADR-022).
 *
 * Pure and deterministic: resolves each blueprint section through the
 * PrimitiveComponentMap and composes site header → sections → site footer
 * under the resolved theme. Registry primitives always resolve — crafted
 * component or labelled placeholder; identifiers OUTSIDE the registry fail
 * loudly in development and degrade gracefully (skip + warn) in production.
 */

import { MotionConfig } from "framer-motion";
import type { CSSProperties, ReactElement } from "react";
import { resolveTheme } from "../theme/theme";
import { SiteFooter, SiteHeader } from "../primitives/site-chrome";
import type { SectionBlueprint, WebsiteBlueprint } from "@/core/website-blueprint";
import { parseSlots, sectionVariant, type SlotMap } from "./slots";
import { resolvePrimitiveComponent } from "./primitive-map";
import type { RenderPageOptions, SiteNavLink } from "./types";

/**
 * Slots that carry internal DIRECTION, not customer copy. Rendered only in
 * preview; in public mode they are also stripped from the props handed to
 * client primitives, so blueprint intent never even reaches the serialized
 * payload of a published page (ADR-034).
 */
const INTERNAL_SLOT_KEYS = new Set([
  "narrative-arc",
  "backdrop-direction",
  "portfolio-direction",
  "captions-direction",
  "gallery-direction",
  "questions-direction",
  "response-notes",
  "attribution-direction",
  "review-themes",
  "fields",
]);

function redactSlots(slots: SlotMap): SlotMap {
  return Object.fromEntries(
    Object.entries(slots).filter(([key]) => !INTERNAL_SLOT_KEYS.has(key)),
  );
}

/** Strip blueprint intent/metadata a public page must never carry. */
function redactSection(section: SectionBlueprint): SectionBlueprint {
  // Extensions carry internal framework metadata (experienceArc, archetype);
  // only the keys the renderer actually consumes survive.
  const extensions: Record<string, unknown> = {};
  if (section.extensions?.variant !== undefined) {
    extensions.variant = section.extensions.variant;
  }
  if (section.extensions?.signatureMoment !== undefined) {
    extensions.signatureMoment = section.extensions.signatureMoment;
  }
  return {
    ...section,
    purpose: "",
    contentRequirements: (section.contentRequirements ?? []).filter(
      (requirement) => requirement.startsWith("qa:"),
    ),
    media: (section.media ?? []).map((media) => ({ ...media, direction: "" })),
    // Internal design rationale the renderer never reads — not serialized.
    suggestedComponents: [],
    animation: undefined,
    interaction: [],
    visibilityRules: [],
    futureAiNotes: [],
    confidence: { ...section.confidence, reasoningRef: "" },
    extensions,
  };
}

/**
 * The blueprint handed to client primitives on PUBLIC pages: identity and
 * page-level conversion survive (primitives render from those); sections,
 * SEO direction, and chrome placeholder contents do not — they are the
 * drawing, not the building.
 */
function redactBlueprint(blueprint: WebsiteBlueprint): WebsiteBlueprint {
  return {
    ...blueprint,
    // Blueprint-level extensions carry archetype + experienceArc — internal.
    extensions: {},
    pages: {
      ...blueprint.pages,
      pages: blueprint.pages.pages.map((page) => ({
        ...page,
        purpose: "",
        sections: [],
        seo: undefined,
        extensions: {},
        futureAiNotes: [],
      })),
    },
    header: { ...blueprint.header, contents: [] },
    footer: { ...blueprint.footer, contents: [], legal: [] },
  };
}

/** Base styles scoped to the rendered site (not the TITAN app). */
const ROOT_CSS = `
.wr-root { -webkit-font-smoothing: antialiased; }
.wr-root ::selection { background: var(--wr-accent); color: var(--wr-accent-ink); }
@media (prefers-reduced-motion: no-preference) {
  .wr-root { scroll-behavior: smooth; }
}
`;

export function renderPage(
  blueprint: WebsiteBlueprint,
  options: RenderPageOptions = {},
): ReactElement {
  const onUnmapped =
    options.onUnmapped ??
    (process.env.NODE_ENV === "production" ? "skip" : "throw");
  const mode = options.mode ?? "preview";
  const collection = blueprint.pages.pages;
  const page = options.pageId
    ? collection.find((candidate) => candidate.id === options.pageId)
    : collection[0];
  if (!page) {
    throw new Error(
      `Page "${options.pageId}" is not in this blueprint's collection.`,
    );
  }
  const theme = resolveTheme(blueprint.designSystem?.themeRef);
  const pageHref =
    options.pageHref ??
    ((pageId: string, suggestedUrl: string) => suggestedUrl || `/${pageId}`);
  // Navigation links every page of the collection (ADR-028); single-page
  // blueprints render no nav (nothing to navigate to).
  const nav: SiteNavLink[] =
    collection.length > 1
      ? (blueprint.navigation.items ?? [])
          .map((item) => {
            const target = collection.find(
              (candidate) => candidate.id === item.toPageId,
            );
            if (!target) return null;
            return {
              pageId: target.id,
              label: item.label ?? target.name,
              href: pageHref(target.id, target.suggestedUrl ?? "/"),
              active: target.id === page.id,
            };
          })
          .filter((link): link is SiteNavLink => link !== null)
      : [];

  // Legal pages (ADR-045) are NOT in the header nav — they get their own
  // footer links, resolved through the same pageHref seam.
  const legalNav: SiteNavLink[] = collection
    .filter((candidate) => candidate.type === "legal")
    .map((legalPage) => ({
      pageId: legalPage.id,
      label: legalPage.name,
      href: pageHref(legalPage.id, legalPage.suggestedUrl ?? "/"),
      active: legalPage.id === page.id,
    }));

  const isPublic = mode === "public";
  const primitiveBlueprint = isPublic ? redactBlueprint(blueprint) : blueprint;
  const sections = page.sections.map((section) => {
    // Registry primitives ALWAYS resolve (crafted or labelled placeholder);
    // null means the identifier is outside the registry — a broken blueprint.
    const Primitive = resolvePrimitiveComponent(section.identifier, options.map);
    if (!Primitive) {
      const detail = `primitive "${section.identifier}" (variant "${sectionVariant(section)}", section "${section.id}")`;
      if (onUnmapped === "throw") {
        throw new Error(
          `No renderer component registered for ${detail}. Add it to PRIMITIVE_COMPONENT_MAP (ADR-022) or render with onUnmapped: "skip".`,
        );
      }
      if (process.env.NODE_ENV !== "test") {
        console.warn(`[website-renderer] Skipping unmapped ${detail}.`);
      }
      return null;
    }
    const slots = parseSlots(section);
    return (
      <Primitive
        key={section.id}
        section={isPublic ? redactSection(section) : section}
        variant={sectionVariant(section)}
        slots={isPublic ? redactSlots(slots) : slots}
        blueprint={primitiveBlueprint}
        serving={options.serving}
        mediaAssets={options.media}
        contact={options.contact}
        mode={mode}
        reviews={options.reviews}
      />
    );
  });

  return (
    <div
      id="top"
      className="wr-root relative"
      style={
        {
          ...theme.vars,
          background: "var(--wr-bg)",
          color: "var(--wr-ink)",
          fontFamily: "var(--wr-font-body, ui-sans-serif, system-ui, sans-serif)",
          fontSize: "var(--wr-text-base)",
        } as CSSProperties
      }
      data-theme={theme.ref}
    >
      <style dangerouslySetInnerHTML={{ __html: ROOT_CSS }} />
      <MotionConfig reducedMotion="user">
        <SiteHeader blueprint={primitiveBlueprint} nav={nav} />
        <main>{sections}</main>
        <SiteFooter
          blueprint={primitiveBlueprint}
          nav={nav}
          legalNav={legalNav}
          mode={mode}
          contact={options.contact}
        />
      </MotionConfig>
    </div>
  );
}
