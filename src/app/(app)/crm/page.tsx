import { AskBrain } from "@/features/brain";
import { CrmPipelinePage } from "@/features/crm";

export const metadata = { title: "CRM · Pipeline" };

/** Thin route: Level 1 — the sales pipeline. */
export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      {/* Ask the Brain (ADR-048) — ask the pipeline questions in English. */}
      <AskBrain placeholder="Ask the Brain — e.g. “Show enquiries for Summit” or “Which builds are stalled?”" />
      <CrmPipelinePage />
    </div>
  );
}
