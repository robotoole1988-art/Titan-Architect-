import { MorphLabPage } from "@/features/website-renderer";

export const metadata = { title: "Morph Lab · The Storm Vortex" };

/**
 * The Morph Lab (ADR-035) — internal preview surface only. The heavy
 * three.js chunk loads through the lab component's own dynamic import;
 * public sites never reference it.
 */
export default function Page() {
  return <MorphLabPage />;
}
