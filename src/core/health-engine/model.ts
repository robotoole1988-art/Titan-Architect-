/**
 * Business Health Engine v1 (ADR-051) — the contracts.
 *
 * Five departments scored purely over the memory spine. Every number is
 * traceable: factors carry weights, inputs in plain English, and evidence
 * records; the formula string renders in the UI. Departments without the
 * data to score honestly say so — never a fake score.
 */

import type { EvidenceRecord } from "@/core/ask-brain";
import type { BrainHealth } from "@/core/brain-orchestrator";
import type { MissionControlThresholds } from "@/core/mission-control";
import type { KnowledgeGraph, Observation } from "@/core/memory-spine";

export type DepartmentId =
  | "enquiries"
  | "pipeline"
  | "delivery"
  | "experience"
  | "measurement";

export type HealthBand = "green" | "amber" | "red";
export type HealthConfidence = "high" | "medium" | "low";

/** One named, weighted, evidence-backed input to a department score. */
export interface HealthFactor {
  id: string;
  label: string;
  /** The inputs, in plain English (e.g. "1 of 2 enquiries answered in SLA"). */
  detail: string;
  /** FINAL weight after renormalisation — factor weights always sum to 1. */
  weight: number;
  /** 0–100. */
  score: number;
  evidence: EvidenceRecord[];
}

export interface HealthTrend {
  /** Score delta vs the latest prior-day snapshot. */
  delta: number;
  direction: "up" | "down" | "flat";
  /** When the prior snapshot was taken. */
  since: string;
}

export interface ScoreableHealth {
  department: DepartmentId;
  scoreable: true;
  /** 0–100, weighted mean of factor scores. */
  score: number;
  band: HealthBand;
  /** Null until a prior-day snapshot exists — first reading, honestly. */
  trend: HealthTrend | null;
  riskLevel: "low" | "medium" | "high";
  confidence: HealthConfidence;
  factors: HealthFactor[];
  /** Named data gaps that lowered confidence (e.g. no Lighthouse runs). */
  gaps: string[];
  /** The inspectable formula, rendered verbatim in the UI. */
  formula: string;
  /** ADR-015's contract, implemented. */
  brainHealth: BrainHealth;
  computedAt: string;
}

export interface UnscoreableHealth {
  department: DepartmentId;
  scoreable: false;
  /** "not yet scoreable — needs X". */
  reason: string;
  brainHealth: BrainHealth;
  computedAt: string;
}

export type DepartmentHealth = ScoreableHealth | UnscoreableHealth;

export interface HealthEngineInput {
  graph: KnowledgeGraph;
  /** Learning-feed observations — prior health_snapshot entries drive trend. */
  observations: ReadonlyArray<Observation>;
  now: string;
  thresholds?: Partial<MissionControlThresholds>;
}

/** Band boundaries — no vanity smoothing. */
export const BAND_GREEN_AT = 80;
export const BAND_AMBER_AT = 55;

export function bandFor(score: number): HealthBand {
  if (score >= BAND_GREEN_AT) return "green";
  if (score >= BAND_AMBER_AT) return "amber";
  return "red";
}

export function brainHealthLevelFor(band: HealthBand): BrainHealth["level"] {
  return band === "green" ? "healthy" : band === "amber" ? "degraded" : "unhealthy";
}
