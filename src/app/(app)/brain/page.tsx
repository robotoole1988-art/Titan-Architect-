import { BrainWorkspace } from "@/features/brain";

export const metadata = { title: "TITAN Brain" };

/** Reads live recommendations on every load (ADR-050). */
export const dynamic = "force-dynamic";

export default function Page() {
  return <BrainWorkspace />;
}
