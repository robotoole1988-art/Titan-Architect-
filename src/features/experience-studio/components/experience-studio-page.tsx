import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  Clapperboard,
  Film,
  MousePointerClick,
  Search,
  Smartphone,
  Sparkles,
  SwatchBook,
  Target,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import { MOCK_STUDIO_REQUEST } from "../model/mock-request";
import {
  BulletList,
  ChipRow,
  CodeList,
  Eyebrow,
  Field,
  StudioCard,
} from "./studio-atoms";

/**
 * Experience Studio — the first visible workspace for reviewing a TITAN
 * Experience Strategy. It renders the Experience Strategy Generator's output
 * (mock data) as a premium "strategy room". Server-rendered; no state, no AI,
 * no website generation.
 */
export function ExperienceStudioPage() {
  const strategy = generateExperienceStrategy(MOCK_STUDIO_REQUEST);
  const {
    meta,
    visualDirection,
    heroConcept,
    storytelling,
    animationStrategy,
    interactiveFeatures,
    mediaDirection,
    conversionStrategy,
    seoStrategy,
    mobileStrategy,
    aiMediaBrief,
  } = strategy;

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
          <Eyebrow>Experience Studio</Eyebrow>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {meta.businessName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{meta.trade}</span>
            <span aria-hidden>·</span>
            <span>{meta.location}</span>
            <span className="ml-1 inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px]">
              Mock data · v{meta.version}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-1.5 sm:items-end">
          <div className="flex items-center gap-2">
            <Button disabled className="gap-2">
              <Wand2 className="size-4" />
              Generate Website
            </Button>
            <Button variant="outline" disabled className="gap-2">
              <Check className="size-4" />
              Approve Strategy
            </Button>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Both coming soon
          </span>
        </div>
      </header>

      {/* Hero Concept — the centrepiece */}
      <section className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-card/40 p-8 shadow-xl shadow-black/20 backdrop-blur-xl duration-700 animate-in fade-in-0 zoom-in-95">
        <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,rgba(251,191,36,0.35),transparent)]" />
        <div className="relative flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
              <Clapperboard className="size-4" />
            </span>
            <Eyebrow>Hero Concept</Eyebrow>
          </div>
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            {heroConcept.headline}
          </h2>
          <p className="max-w-2xl text-lg text-foreground/80">
            {heroConcept.subheadline}
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {heroConcept.visualConcept}
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-4 py-2 text-sm font-medium text-amber-200 ring-1 ring-amber-400/25 ring-inset">
              {heroConcept.primaryCta}
              <ArrowRight className="size-4" />
            </span>
          </div>
        </div>
      </section>

      {/* Strategy grid */}
      <div className="grid gap-4 duration-700 animate-in fade-in-0 lg:grid-cols-2">
        <StudioCard
          index="01"
          icon={SwatchBook}
          title="Visual Direction"
          summary={visualDirection.summary}
        >
          <Field label="Aesthetic">{visualDirection.aesthetic}</Field>
          <Field label="Mood">
            <ChipRow items={visualDirection.moodKeywords} accent />
          </Field>
          <Field label="Colour direction">
            <BulletList items={visualDirection.colourDirection} />
          </Field>
          <Field label="Typography">{visualDirection.typographyDirection}</Field>
        </StudioCard>

        <StudioCard
          index="02"
          icon={BookOpen}
          title="Storytelling"
          summary={storytelling.summary}
        >
          <Field label="Narrative arc">{storytelling.narrativeArc}</Field>
          <Field label="Key messages">
            <BulletList items={storytelling.keyMessages} />
          </Field>
          <Field label="Emotional hooks">
            <ChipRow items={storytelling.emotionalHooks} />
          </Field>
        </StudioCard>

        <StudioCard
          index="03"
          icon={Film}
          title="Animation Strategy"
          summary={animationStrategy.summary}
        >
          <Field label="Principles">
            <ChipRow items={animationStrategy.principles} />
          </Field>
          <Field label="Signature moments">
            <BulletList items={animationStrategy.signatureMoments} />
          </Field>
          <Field label="Intensity">
            <span className="capitalize">{animationStrategy.intensity}</span>
          </Field>
        </StudioCard>

        <StudioCard
          index="04"
          icon={MousePointerClick}
          title="Interactive Features"
          summary={interactiveFeatures.summary}
        >
          <Field label="Features">
            <BulletList items={interactiveFeatures.features} />
          </Field>
        </StudioCard>

        <StudioCard
          index="05"
          icon={Camera}
          title="Media Direction"
          summary={mediaDirection.summary}
        >
          <Field label="Photography">{mediaDirection.photographyStyle}</Field>
          <Field label="Video">{mediaDirection.videoStyle}</Field>
          {mediaDirection.threeDStyle && (
            <Field label="3D">{mediaDirection.threeDStyle}</Field>
          )}
          <Field label="Shot list">
            <BulletList items={mediaDirection.shotList} />
          </Field>
        </StudioCard>

        <StudioCard
          index="06"
          icon={Target}
          title="Conversion Strategy"
          summary={conversionStrategy.summary}
        >
          <Field label="Primary CTA">{conversionStrategy.primaryCta}</Field>
          <Field label="Lead-capture flows">
            <BulletList items={conversionStrategy.leadCaptureFlows} />
          </Field>
          <Field label="Trust signals">
            <ChipRow items={conversionStrategy.trustSignals} />
          </Field>
        </StudioCard>

        <StudioCard
          index="07"
          icon={Search}
          title="SEO Strategy"
          summary={seoStrategy.summary}
        >
          <Field label="Primary keywords">
            <ChipRow items={seoStrategy.primaryKeywords} accent />
          </Field>
          <Field label="Local keywords">
            <ChipRow items={seoStrategy.localKeywords} />
          </Field>
          <Field label="Schema">
            <ChipRow items={seoStrategy.schemaTypes} />
          </Field>
          <Field label="Content pillars">
            <BulletList items={seoStrategy.contentPillars} />
          </Field>
        </StudioCard>

        <StudioCard
          index="08"
          icon={Smartphone}
          title="Mobile Strategy"
          summary={mobileStrategy.summary}
        >
          <Field label="Principles">
            <BulletList items={mobileStrategy.principles} />
          </Field>
          <Field label="Performance targets">
            <BulletList items={mobileStrategy.performanceTargets} />
          </Field>
        </StudioCard>

        <StudioCard
          index="09"
          icon={Sparkles}
          title="AI Media Brief"
          summary={aiMediaBrief.summary}
          className="lg:col-span-2"
        >
          <Field label="Style guidance">{aiMediaBrief.styleGuidance}</Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Image prompts">
              <CodeList items={aiMediaBrief.imagePrompts} />
            </Field>
            <Field label="Video prompts">
              <CodeList items={aiMediaBrief.videoPrompts} />
            </Field>
          </div>
        </StudioCard>
      </div>
    </div>
  );
}
