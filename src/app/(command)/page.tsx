import { CommandCentrePage } from "@/features/command-centre";
import { requireFounder } from "@/features/auth";

/**
 * "/" — the founder lands in the Command Centre (ADR-057). Live queries on
 * every load; the room is never cached ahead of the world it describes.
 */
export const dynamic = "force-dynamic";

export default async function RootPage() {
  const session = await requireFounder();
  const founderName = session.name.split(" ")[0] || session.name;
  return <CommandCentrePage founderName={founderName} />;
}
