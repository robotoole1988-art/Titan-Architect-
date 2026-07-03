/**
 * Repository abstractions for the Business Spine (ADR-023).
 *
 * Features and engines consume THESE interfaces — never a database client.
 * Adapters (in-memory, Supabase) implement the same contract and are proven
 * by one shared contract test suite (tests/core/business/).
 */

import type { Business, BusinessDraft, LifecycleStage } from "./model";

export class BusinessNotFoundError extends Error {
  constructor(id: string) {
    super(`Business "${id}" not found`);
    this.name = "BusinessNotFoundError";
  }
}

export interface BusinessRepository {
  /** Create a Business from an intake draft: stage "lead", history opened. */
  create(draft: BusinessDraft): Promise<Business>;
  get(id: string): Promise<Business | null>;
  /** Newest first. */
  list(): Promise<Business[]>;
  /**
   * Move the lifecycle stage, appending to stage history (no-op history-wise
   * when the stage is unchanged). Throws {@link BusinessNotFoundError}.
   */
  updateStage(id: string, stage: LifecycleStage): Promise<Business>;
  /** Delete the business and (cascade) its artifacts. */
  remove(id: string): Promise<void>;
}

/** The artifact kinds the pipeline persists today. */
export type ArtifactKind = "strategy" | "blueprint";

/** A saved, versioned pipeline artifact linked to its Business. */
export interface ArtifactRecord<T = unknown> {
  id: string;
  businessId: string;
  kind: ArtifactKind;
  /** 1-based, auto-incremented per business + kind. Never overwritten. */
  version: number;
  payload: T;
  /** Cross-references, e.g. { strategyVersion: 2 } on a blueprint. */
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface SaveArtifactInput<T> {
  businessId: string;
  kind: ArtifactKind;
  payload: T;
  meta?: Record<string, unknown>;
}

export interface ArtifactRepository {
  /** Version = latest + 1. Throws {@link BusinessNotFoundError} for unknown ids. */
  save<T>(input: SaveArtifactInput<T>): Promise<ArtifactRecord<T>>;
  latest<T>(businessId: string, kind: ArtifactKind): Promise<ArtifactRecord<T> | null>;
  getVersion<T>(
    businessId: string,
    kind: ArtifactKind,
    version: number,
  ): Promise<ArtifactRecord<T> | null>;
  /** Newest first. */
  listVersions(businessId: string, kind: ArtifactKind): Promise<ArtifactRecord[]>;
}

/** Everything the spine persists, resolved together. */
export interface BusinessSpineRepositories {
  businesses: BusinessRepository;
  artifacts: ArtifactRepository;
}
