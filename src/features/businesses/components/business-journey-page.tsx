import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDashed,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ALL_LIFECYCLE_STATES,
  resolveBusinessSpine,
  stageLabel,
  type ArtifactRecord,
  type Business,
} from "@/core/business";
import {
  generateBlueprintArtifact,
  generateStrategyArtifact,
} from "@/features/experience-studio";
import { setBusinessStage } from "../api/actions";

/**
 * The Journey view (ADR-023): one business, its pipeline. Read-mostly — the
 * seed of the command centre, not the full CRM. Stages are done (link),
 * available (action), or upcoming (greyed).
 */

type StepStatus = "done" | "available" | "upcoming";

interface JourneyStep {
  title: string;
  status: StepStatus;
  detail: string;
  href?: string;
  hrefLabel?: string;
  action?: () => Promise<void>;
  actionLabel?: string;
}

function stepBadge(status: StepStatus) {
  if (status === "done") {
    return (
      <span className="flex size-8 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
        <Check className="size-4" />
      </span>
    );
  }
  if (status === "available") {
    return (
      <span className="flex size-8 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300">
        <ArrowRight className="size-4" />
      </span>
    );
  }
  return (
    <span className="flex size-8 items-center justify-center rounded-full border border-border/60 bg-muted/20 text-muted-foreground">
      <CircleDashed className="size-4" />
    </span>
  );
}

function JourneyRow({ step }: { step: JourneyStep }) {
  const muted = step.status === "upcoming";
  return (
    <li
      className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-5 py-4 ${
        muted
          ? "border-border/40 bg-card/20 opacity-60"
          : "border-border/60 bg-card/40"
      }`}
      data-step={step.title}
      data-status={step.status}
    >
      <div className="flex min-w-0 items-center gap-4">
        {stepBadge(step.status)}
        <div className="min-w-0">
          <p className="font-medium">{step.title}</p>
          <p className="truncate text-sm text-muted-foreground">{step.detail}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {step.href && step.status === "done" && (
          <Button
            size="sm"
            variant="outline"
            render={<Link href={step.href} />}
            className="gap-1.5"
          >
            {step.hrefLabel ?? "Open"}
            <ArrowRight className="size-3.5" />
          </Button>
        )}
        {step.action && step.status !== "upcoming" && (
          <form action={step.action}>
            <Button size="sm" type="submit" variant={step.status === "done" ? "ghost" : "default"}>
              {step.actionLabel}
            </Button>
          </form>
        )}
      </div>
    </li>
  );
}

function buildSteps(
  business: Business,
  strategy: ArtifactRecord | null,
  blueprint: ArtifactRecord | null,
): JourneyStep[] {
  return [
    {
      title: "Business",
      status: "done",
      detail: `${business.trade} · ${business.location} — captured ${new Date(business.createdAt).toLocaleDateString("en-GB")}`,
    },
    {
      title: "Strategy",
      status: strategy ? "done" : "available",
      detail: strategy
        ? `Strategy artifact v${strategy.version} stored`
        : "Generate the Experience Strategy (saved as v1).",
      href: `/experience-studio?businessId=${business.id}`,
      hrefLabel: "Open strategy",
      action: async () => {
        "use server";
        await generateStrategyArtifact(business.id);
      },
      actionLabel: strategy ? "Regenerate" : "Generate Strategy",
    },
    {
      title: "Blueprint",
      status: blueprint ? "done" : strategy ? "available" : "upcoming",
      detail: blueprint
        ? `Blueprint artifact v${blueprint.version} stored${
            typeof blueprint.meta?.strategyVersion === "number"
              ? ` (from strategy v${blueprint.meta.strategyVersion})`
              : ""
          }`
        : strategy
          ? "Compose the Website Blueprint from the stored strategy."
          : "Needs a strategy first.",
      href: `/experience-studio/blueprint?businessId=${business.id}`,
      hrefLabel: "Open blueprint",
      action: strategy
        ? async () => {
            "use server";
            await generateBlueprintArtifact(business.id);
          }
        : undefined,
      actionLabel: blueprint ? "Regenerate" : "Generate Blueprint",
    },
    {
      title: "Website",
      status: blueprint ? "done" : "upcoming",
      detail: blueprint
        ? "The Renderer composes the stored blueprint into a live preview."
        : "Unlocked once a blueprint exists.",
      href: `/experience-studio/preview?businessId=${business.id}`,
      hrefLabel: "Open preview",
    },
    {
      title: "Marketing",
      status: "upcoming",
      detail: "Planned — the Growth Engine takes over from here.",
    },
  ];
}

export async function BusinessJourneyPage({ businessId }: { businessId: string }) {
  const spine = await resolveBusinessSpine();
  const business = await spine.businesses.get(businessId);
  if (!business) notFound();

  const [strategy, blueprint] = await Promise.all([
    spine.artifacts.latest(business.id, "strategy"),
    spine.artifacts.latest(business.id, "blueprint"),
  ]);
  const steps = buildSteps(business, strategy, blueprint);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link
            href="/businesses"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            All businesses
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {business.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {business.trade} · {business.location}
            {business.goal ? ` · ${business.goal}` : ""}
          </p>
        </div>

        {/* the journey's one write: the lifecycle stage */}
        <form
          action={async (formData: FormData) => {
            "use server";
            await setBusinessStage(business.id, String(formData.get("stage")));
          }}
          className="flex items-center gap-2"
        >
          <label htmlFor="journey-stage" className="text-xs text-muted-foreground">
            Lifecycle stage
          </label>
          <select
            id="journey-stage"
            name="stage"
            // Remount when the stage changes: defaultValue only applies on mount.
            key={business.stage}
            defaultValue={business.stage}
            className="h-8 rounded-lg border border-border/60 bg-background px-2 text-sm capitalize"
          >
            {ALL_LIFECYCLE_STATES.map((stage) => (
              <option key={stage} value={stage} className="capitalize">
                {stageLabel(stage)}
              </option>
            ))}
          </select>
          <Button size="sm" variant="outline" type="submit">
            Set stage
          </Button>
        </form>
      </header>

      {/* stage history strip */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        {business.stageHistory.map((transition) => (
          <span
            key={`${transition.stage}-${transition.enteredAt}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/20 px-2.5 py-0.5"
          >
            <span className="capitalize">{transition.stage}</span>
            <span>
              {new Date(transition.enteredAt).toLocaleDateString("en-GB")}
            </span>
          </span>
        ))}
      </div>

      <ol className="flex flex-col gap-3">
        {steps.map((step) => (
          <JourneyRow key={step.title} step={step} />
        ))}
      </ol>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Megaphone className="size-3.5" />
        Regenerating never overwrites — every strategy and blueprint version is
        kept on the business record.
      </p>
    </div>
  );
}
