import { MorphLabPage, resolveMorphLab } from "@/features/website-renderer";

export const metadata = { title: "Morph Lab · The Storm Vortex" };
export const dynamic = "force-dynamic";

/**
 * The Morph Lab (ADR-035) — internal preview surface only. Environment
 * domes are founder-gated media (v2): resolved through the feature,
 * reviewed at the lab business's media gate. The heavy three.js chunk
 * loads through the lab component's own dynamic import; public sites
 * never reference it.
 */
export default async function Page() {
  const { environment, canGenerate } = await resolveMorphLab();
  return <MorphLabPage environment={environment} canGenerate={canGenerate} />;
}
