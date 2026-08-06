import { notFound } from "next/navigation";
import { resolveDemoSite, WebsiteDemoPage } from "@/features/website-renderer";

/**
 * "/experience/demo/[trade]/[town]" — the generator demo (PRD-007 §3.5).
 *
 * The production chain, run for a named trade and town, served as a
 * standalone document: the flagship's climax, and independently a page a
 * prospect can be shown. Trade must be an exact taxonomy id and the town
 * survives hard sanitisation, or this is a 404 (the resolver's laws, and
 * proposed ADR-070's). Deterministic → force-static + ISR: each
 * combination renders once and caches, so repeat picks are edge hits.
 * Never indexed — a fabricated example business must not enter the index.
 */
export const dynamic = "force-static";
export const revalidate = 3600;

interface DemoParams {
  params: Promise<{ trade: string; town: string }>;
}

export async function generateMetadata({ params }: DemoParams) {
  const { trade, town } = await params;
  const resolved = resolveDemoSite({ trade, town });
  return {
    title: resolved
      ? `${resolved.businessName}, ${resolved.town} — TITAN example`
      : "Example not found — TITAN",
    robots: { index: false },
  };
}

export default async function Page({ params }: DemoParams) {
  const { trade, town } = await params;
  const resolved = resolveDemoSite({ trade, town });
  if (!resolved) notFound();
  return <WebsiteDemoPage resolved={resolved} />;
}
