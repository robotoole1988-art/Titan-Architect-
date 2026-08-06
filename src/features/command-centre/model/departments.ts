/**
 * The nine departments of the TITAN organism — the room's cast list
 * (approved by the founder 2026-08-06, with the Command Centre room design).
 *
 * This module records which departments exist, which have a real room
 * behind their orb, and how their build status is told. Statuses are build
 * truth, not aspiration: "alive" means the module is deployed and doing its
 * job today; "partly" means some of it is; "forming" means it does not
 * exist yet — those orbs render dim, dashed and deliberately doorless
 * (no fake doors, ADR-034).
 *
 * Health BANDS are never stored here — they come from the health engine
 * through the facts snapshot at render time; `healthKey` is the join. The
 * Sales orb's room is the CRM (the founder's naming, 2026-08-06): sales
 * work happens in the CRM, so the orb says so.
 */

export type DepartmentStatus = "alive" | "partly" | "forming";

export type DepartmentHealthKey =
  | "enquiries"
  | "pipeline"
  | "delivery"
  | "experience"
  | "measurement";

export interface CommandDepartment {
  id: string;
  /** The orb's name, as spoken in the room. */
  name: string;
  /**
   * Route of the department's real room. null while nothing exists —
   * a forming department gets no door until there is a room behind it.
   */
  room: string | null;
  /** Build truth today. */
  status: DepartmentStatus;
  /** The line under the name — build truth, in room language. */
  stateLabel: string;
  /** Orb core colour. */
  hue: string;
  /** Orb glow (translucent halo). */
  glow: string;
  /** Health-engine department this orb reports, when one measures it. */
  healthKey: DepartmentHealthKey | null;
  /** Which flank of the Brain the orb stands on. */
  side: "left" | "right";
}

export const COMMAND_DEPARTMENTS: readonly CommandDepartment[] = [
  // ---- left flank ------------------------------------------------------
  {
    id: "marketing",
    name: "Marketing",
    room: "/market",
    status: "alive",
    stateLabel: "Alive",
    hue: "#5aa2ff",
    glow: "rgba(90,162,255,0.55)",
    healthKey: "measurement",
    side: "left",
  },
  {
    id: "seo",
    name: "SEO",
    room: null,
    status: "partly",
    stateLabel: "Partly alive",
    hue: "#41d6c3",
    glow: "rgba(65,214,195,0.5)",
    healthKey: null,
    side: "left",
  },
  {
    id: "automation",
    name: "Automation",
    room: null,
    status: "forming",
    stateLabel: "Forming",
    hue: "#b48bff",
    glow: "rgba(180,139,255,0.5)",
    healthKey: null,
    side: "left",
  },
  {
    id: "customer-relations",
    name: "Customer Relations",
    room: null,
    status: "forming",
    stateLabel: "Forming",
    hue: "#ff8ba7",
    glow: "rgba(255,139,167,0.5)",
    healthKey: null,
    side: "left",
  },
  // ---- right flank -----------------------------------------------------
  {
    id: "sales",
    name: "Sales",
    room: "/crm",
    status: "alive",
    stateLabel: "CRM · Alive",
    hue: "#9ddb5a",
    glow: "rgba(157,219,90,0.5)",
    healthKey: "pipeline",
    side: "right",
  },
  {
    id: "website-ai",
    name: "Website AI",
    room: "/experience-studio",
    status: "alive",
    stateLabel: "Alive",
    hue: "#c0a4ff",
    glow: "rgba(192,164,255,0.55)",
    healthKey: "experience",
    side: "right",
  },
  {
    id: "reception",
    name: "Reception",
    room: "/dashboard",
    status: "partly",
    stateLabel: "Forms live · calls forming",
    hue: "#ffb15a",
    glow: "rgba(255,177,90,0.5)",
    healthKey: "enquiries",
    side: "right",
  },
  {
    id: "finance",
    name: "Finance",
    room: null,
    status: "forming",
    stateLabel: "Forming",
    hue: "#ffd268",
    glow: "rgba(255,210,104,0.5)",
    healthKey: null,
    side: "right",
  },
  {
    id: "operations",
    name: "Operations",
    room: null,
    status: "forming",
    stateLabel: "Forming",
    hue: "#6ee7ff",
    glow: "rgba(110,231,255,0.5)",
    healthKey: null,
    side: "right",
  },
];
