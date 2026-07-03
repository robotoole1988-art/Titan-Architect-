import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clapperboard,
  Film,
  Image as ImageIcon,
  Layers,
  MousePointerClick,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateExperienceStrategy,
  type ExperienceStrategyRequest,
} from "@/core/experience-strategy";
import {
  SECTION_PRIMITIVE_REGISTRY,
  createWebsiteBlueprintEngine,
  getSectionPrimitive,
  validateBlueprint,
  type SectionBlueprint,
} from "@/core/website-blueprint";
import { MOCK_STUDIO_REQUEST } from "../model/mock-request";
import { AccentChip, Chip, Eyebrow, Field } from "./studio-atoms";

/**
 * Blueprint Viewer — a read-only view of the generated Website Blueprint. It
 * shows the *architecture* the engine produced: the ordered section primitives,
 * their variants, intent, and content slots — not a visual website (that is the
 * future Renderer's job; see ADR-021).
 */
interface BlueprintViewerPageProps {
  businessName?: string;
  trade?: string;
  location?: string;
}

function stringExtension(
  extensions: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = extensions?.[key];
  return typeof value === "string" ? value : undefined;
}

/** Split a "slot: direction" content requirement into its parts. */
function parseSlot(requirement: string): { slot: string; direction: string } {
  const separator = requirement.indexOf(":");
  if (separator === -1) return { slot: "content", direction: requirement };
  return {
    slot: requirement.slice(0, separator).trim(),
    direction: requirement.slice(separator + 1).trim(),
  };
}

function aspectChips(section: SectionBlueprint): string[] {
  const aspects: string[] = [];
  if (section.animation) {
    aspects.push(`animation · ${section.animation.intensity ?? "balanced"}`);
  }
  for (const interaction of section.interaction ?? []) {
    aspects.push(`interaction · ${interaction.type}`);
  }
  for (const media of section.media ?? []) {
    aspects.push(`media · ${media.kind}`);
  }
  return aspects;
}

/**
 * Follows the same decoupled URL boundary as the studio (ADR-019): business
 * context arrives via the URL; when absent or incomplete the viewer degrades
 * gracefully to the sample business.
 */
export async function BlueprintViewerPage({
  businessName,
  trade,
  location,
}: BlueprintViewerPageProps = {}) {
  const name = businessName?.trim();
  const tradeValue = trade?.trim();
  const locationValue = location?.trim();
  const fromIntake = Boolean(name && tradeValue && locationValue);
  const request: ExperienceStrategyRequest =
    name && tradeValue && locationValue
      ? { businessName: name, trade: tradeValue, location: locationValue }
      : MOCK_STUDIO_REQUEST;

  const strategy = generateExperienceStrategy(request);
  const engine = createWebsiteBlueprintEngine();
  const blueprint = await engine.build({ strategy });
  const validation = validateBlueprint(blueprint, SECTION_PRIMITIVE_REGISTRY);

  const [homePage] = blueprint.pages.pages;
  const experienceArc = stringExtension(blueprint.extensions, "experienceArc");
  const archetype = stringExtension(blueprint.extensions, "archetype");

  const query = fromIntake
    ? `?businessName=${encodeURIComponent(request.businessName)}&trade=${encodeURIComponent(request.trade)}&location=${encodeURIComponent(request.location)}`
    : "";
  const strategyHref = `/experience-studio${query}`;
  const previewHref = `/experience-studio/preview${query}`;

  return (
    <div className="relative flex flex-1 flex-col gap-6">
      {/* ambient gold backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/3 top-0 size-[440px] -translate-x-1/2 rounded-full bg-amber-500/[0.08] blur-[130px]" />
        <div className="absolute right-0 top-40 size-[300px] rounded-full bg-orange-500/[0.06] blur-[120px]" />
      </div>

      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-6 duration-500 animate-in fade-in-0 slide-in-from-top-2">
        <div className="flex flex-col gap-2">
          <Eyebrow>Website Blueprint</Eyebrow>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {blueprint.identity.businessName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{blueprint.identity.trade}</span>
            <span aria-hidden>·</span>
            <span>{blueprint.identity.location}</span>
            <span className="ml-1 inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px]">
              {fromIntake ? "From Business Intake" : "Sample business"} ·
              schema v{blueprint.version}
            </span>
            {archetype && (
              <span className="inline-flex items-center rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[11px] text-amber-200/90 capitalize">
                {archetype} archetype
              </span>
            )}
            <span
              className={
                validation.valid
                  ? "inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-300/90"
                  : "inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[11px] text-destructive"
              }
            >
              <ShieldCheck className="size-3" />
              {validation.valid
                ? "Validated against the primitive registry"
                : `${validation.errors.length} registry violations`}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          render={<Link href={strategyHref} />}
          nativeButton={false}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Back to Strategy
        </Button>
      </header>

      {/* Experience arc — how the page reads top to bottom */}
      {experienceArc && (
        <section className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-card/40 p-6 shadow-xl shadow-black/20 backdrop-blur-xl duration-700 animate-in fade-in-0 zoom-in-95">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,rgba(251,191,36,0.35),transparent)]" />
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
                <Clapperboard className="size-4" />
              </span>
              <Eyebrow>Experience Arc</Eyebrow>
            </div>
            <p className="max-w-3xl text-base leading-relaxed text-foreground/85">
              {experienceArc}
            </p>
            <p className="text-sm text-muted-foreground">
              {homePage.sections.length} sections · homepage only · composed
              1:1 from registered primitives — the Renderer never free-generates
              layout.
            </p>
          </div>
        </section>
      )}

      {/* Ordered section cards */}
      <div className="flex flex-col gap-4 duration-700 animate-in fade-in-0">
        {homePage.sections.map((section, index) => {
          const primitive = getSectionPrimitive(
            SECTION_PRIMITIVE_REGISTRY,
            section.identifier,
          );
          const variant = stringExtension(section.extensions, "variant");
          const slots = (section.contentRequirements ?? []).map(parseSlot);
          const aspects = aspectChips(section);

          return (
            <section
              key={section.id}
              className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 shadow-xl shadow-black/20 backdrop-blur-xl transition-colors hover:border-amber-400/25"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,rgba(251,191,36,0.28),transparent)]" />
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
                    <Layers className="size-4" />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-mono text-[11px] text-amber-300/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-base font-semibold tracking-tight">
                      {primitive?.name ?? section.identifier}
                    </h3>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md border border-border/60 bg-background/50 px-2 py-1 font-mono text-[11px] text-muted-foreground">
                    {section.identifier}
                  </span>
                  {variant && <AccentChip>{variant}</AccentChip>}
                  <Chip>{section.priority}</Chip>
                </div>
              </header>

              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {section.purpose}
              </p>

              {slots.length > 0 && (
                <Field label="Content slots">
                  <dl className="flex flex-col gap-2">
                    {slots.map(({ slot, direction }) => (
                      <div key={slot} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                        <dt className="shrink-0 font-mono text-xs text-amber-300/70 sm:w-44">
                          {slot}
                        </dt>
                        <dd className="text-sm leading-relaxed text-foreground/85">
                          {direction}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Field>
              )}

              {aspects.length > 0 && (
                <Field label="Aspects">
                  <div className="flex flex-wrap gap-1.5">
                    {aspects.map((aspect) => (
                      <span
                        key={aspect}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-xs text-foreground/80"
                      >
                        {aspect.startsWith("animation") && <Film className="size-3" />}
                        {aspect.startsWith("interaction") && (
                          <MousePointerClick className="size-3" />
                        )}
                        {aspect.startsWith("media") && <ImageIcon className="size-3" />}
                        {aspect}
                      </span>
                    ))}
                  </div>
                </Field>
              )}
            </section>
          );
        })}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-3">
          <Button
            render={<Link href={previewHref} />}
            nativeButton={false}
            className="gap-2"
          >
            Preview Website
            <ArrowRight className="size-4" />
          </Button>
          <span>The Renderer composes these primitives into a real page.</span>
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
          {homePage.sections.length} sections
          <ArrowRight className="size-3" />
          {homePage.suggestedUrl}
        </span>
      </footer>
    </div>
  );
}
