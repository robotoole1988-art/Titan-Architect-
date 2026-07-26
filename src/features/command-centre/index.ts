/**
 * Command Centre — feature public API (ADR-057).
 *
 * The founder's landing room (Layer 1 of the two-layer model). This is the
 * ONLY file other layers may import from. Note the naming: this feature is
 * the landing SURFACE; the Brain's approval queue keeps the name Command
 * Mode (ADR-052) and its `CommandCentre` component stays private to the
 * brain feature.
 */

export { CommandCentrePage } from "./components/command-centre-page";
export { loadCommandCentreFacts } from "./api/load";
export {
  clickCountTable,
  type ClickCountRow,
} from "./model/navigation";
