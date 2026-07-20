import { loadCommandCentre } from "../api/commands";
import { CommandQueue } from "./command-queue";

/**
 * Command Mode (ADR-052) — server-side load of the derived approval queue
 * and execution history, client-side founder controls.
 */
export async function CommandCentre() {
  const { pending, history, rejected } = await loadCommandCentre();
  return <CommandQueue pending={pending} history={history} rejected={rejected} />;
}
