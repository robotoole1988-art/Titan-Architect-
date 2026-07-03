import { BusinessIntakeForm } from "./business-intake-form";
import { SavedIntakesList } from "./saved-intakes-list";

/**
 * Business Intake — the first step of the Business → Blueprint journey. A
 * premium onboarding surface: enter a business's details and it becomes a
 * durable Business record (stage: lead) in the Business Spine (ADR-023).
 */
export function BusinessIntakePage() {
  return (
    <div className="relative flex flex-1 flex-col gap-8">
      {/* ambient onboarding backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-0 size-[420px] -translate-x-1/2 rounded-full bg-emerald-500/[0.07] blur-[130px]" />
        <div className="absolute right-0 top-32 size-[280px] rounded-full bg-teal-500/[0.05] blur-[120px]" />
      </div>

      <header className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-emerald-400/80">
          Business Intake · Step 1
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Start a new onboarding
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Enter the essentials TITAN needs before generating a strategy and a
          website blueprint. Saving creates the Business record — the spine
          every strategy, blueprint, and website hangs off.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium tracking-tight text-muted-foreground">
            Business details
          </h2>
          <BusinessIntakeForm />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium tracking-tight text-muted-foreground">
            Saved intakes
          </h2>
          <SavedIntakesList />
        </div>
      </div>
    </div>
  );
}
