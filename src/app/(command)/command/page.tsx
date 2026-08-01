import { CommandCentrePage } from "@/features/command-centre";
import { requireFounder } from "@/features/auth";

/**
 * "/command" — the founder lands in the Command Centre (ADR-057). Live
 * queries on every load; the room is never cached ahead of the world it
 * describes.
 *
 * This was "/" until ADR-064 gave the root to TITAN's public company site.
 * Sign-in lands here, so the founder's actual route in — click the magic
 * link, arrive in the room — is unchanged.
 */
export const dynamic = "force-dynamic";

export default async function CommandCentreRoute() {
  const session = await requireFounder();
  const founderName = session.name.split(" ")[0] || session.name;
  return <CommandCentrePage founderName={founderName} />;
}
