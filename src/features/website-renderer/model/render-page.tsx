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
import type { WebsiteBlueprint } from "@/core/website-blueprint";
import { parseSlots, sectionVariant } from "./slots";
import { resolvePrimitiveComponent } from "./primitive-map";
import type { RenderPageOptions, SiteNavLink } from "./types";

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
    return (
      <Primitive
        key={section.id}
        section={section}
        variant={sectionVariant(section)}
        slots={parseSlots(section)}
        blueprint={blueprint}
        serving={options.serving}
        mediaAssets={options.media}
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
        <SiteHeader blueprint={blueprint} nav={nav} />
        <main>{sections}</main>
        <SiteFooter blueprint={blueprint} nav={nav} />
      </MotionConfig>
    </div>
  );
}
