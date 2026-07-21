import { requireFounder } from "@/features/auth";
import { DemoPage } from "@/features/demo";

export const metadata = { title: "The Reveal" };

// Live pitch surface — always the founder's freshest prepared state.
export const dynamic = "force-dynamic";

/**
 * Thin route: The Reveal (ADR-055). Chrome-free (preview group) but HARD
 * inside the auth wall — the middleware gates it, and the founder session
 * is re-checked here because this group has no guarded layout.
 */
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ variant?: string }>;
}) {
  await requireFounder();
  const { businessId } = await params;
  const { variant } = await searchParams;
  return <DemoPage businessId={businessId} variant={variant} />;
}
