/**
 * In-memory adapter — the zero-setup default (ADR-023).
 *
 * Keeps the app fully working with no configuration: data survives
 * navigation and HMR (state parked on globalThis in the provider) but NOT a
 * server restart. The Supabase adapter is the durable store.
 */

import type { Business, BusinessDraft, LifecycleStage } from "./model";
import {
  BUILD_ITEM_KINDS,
  assertBuildItemTransition,
  isManualBuildKind,
  type BuildItemKind,
  type BuildItemStatus,
} from "./build-model";
import {
  BusinessNotFoundError,
  type ActivityEntry,
  type ActivityRepository,
  type ArtifactKind,
  type ArtifactRecord,
  type ArtifactRepository,
  type Build,
  type BuildRepository,
  type BusinessRepository,
  type BusinessSpineRepositories,
  type LogActivityInput,
  type SaveArtifactInput,
} from "./repository";

interface MemoryState {
  businesses: Map<string, Business>;
  artifacts: ArtifactRecord[];
  activity: ActivityEntry[];
  builds: Build[];
  /** Monotonic insertion order — timestamps can tie within a millisecond. */
  sequence: Map<string, number>;
  nextSequence: number;
}

function nowIso(): string {
  return new Date().toISOString();
}

class MemoryBusinessRepository implements BusinessRepository {
  constructor(private readonly state: MemoryState) {}

  async create(draft: BusinessDraft): Promise<Business> {
    const createdAt = nowIso();
    const business: Business = {
      ...draft,
      id: crypto.randomUUID(),
      stage: "lead",
      stageHistory: [{ stage: "lead", enteredAt: createdAt }],
      createdAt,
      updatedAt: createdAt,
    };
    this.state.businesses.set(business.id, business);
    this.state.sequence.set(business.id, this.state.nextSequence++);
    return structuredClone(business);
  }

  async get(id: string): Promise<Business | null> {
    const business = this.state.businesses.get(id);
    return business ? structuredClone(business) : null;
  }

  async list(): Promise<Business[]> {
    const order = this.state.sequence;
    return [...this.state.businesses.values()]
      .sort((a, b) => (order.get(b.id) ?? 0) - (order.get(a.id) ?? 0))
      .map((business) => structuredClone(business));
  }

  async updateStage(
    id: string,
    stage: LifecycleStage,
    reason?: string,
  ): Promise<Business> {
    const business = this.state.businesses.get(id);
    if (!business) throw new BusinessNotFoundError(id);
    if (business.stage !== stage) {
      const enteredAt = nowIso();
      const updated: Business = {
        ...business,
        stage,
        stageHistory: [
          ...business.stageHistory,
          { stage, enteredAt, ...(reason ? { reason } : {}) },
        ],
        updatedAt: enteredAt,
      };
      this.state.businesses.set(id, updated);
      return structuredClone(updated);
    }
    return structuredClone(business);
  }

  async remove(id: string): Promise<void> {
    this.state.businesses.delete(id);
    this.state.artifacts = this.state.artifacts.filter(
      (artifact) => artifact.businessId !== id,
    );
    this.state.activity = this.state.activity.filter(
      (entry) => entry.businessId !== id,
    );
    this.state.builds = this.state.builds.filter(
      (build) => build.businessId !== id,
    );
  }
}

class MemoryActivityRepository implements ActivityRepository {
  constructor(private readonly state: MemoryState) {}

  async log(input: LogActivityInput): Promise<ActivityEntry> {
    if (!this.state.businesses.has(input.businessId)) {
      throw new BusinessNotFoundError(input.businessId);
    }
    const entry: ActivityEntry = {
      id: crypto.randomUUID(),
      businessId: input.businessId,
      kind: input.kind,
      message: input.message,
      ...(input.meta ? { meta: structuredClone(input.meta) } : {}),
      createdAt: nowIso(),
    };
    this.state.activity.push(entry);
    return structuredClone(entry);
  }

  async list(businessId: string): Promise<ActivityEntry[]> {
    // Insertion order is authoritative; newest first.
    return this.state.activity
      .filter((entry) => entry.businessId === businessId)
      .reverse()
      .map((entry) => structuredClone(entry));
  }
}

class MemoryBuildRepository implements BuildRepository {
  constructor(private readonly state: MemoryState) {}

  async createForBusiness(
    businessId: string,
  ): Promise<{ build: Build; created: boolean }> {
    if (!this.state.businesses.has(businessId)) {
      throw new BusinessNotFoundError(businessId);
    }
    const existing = this.state.builds.find(
      (build) => build.businessId === businessId,
    );
    if (existing) return { build: structuredClone(existing), created: false };

    const createdAt = nowIso();
    const buildId = crypto.randomUUID();
    const build: Build = {
      id: buildId,
      businessId,
      createdAt,
      items: BUILD_ITEM_KINDS.map((kind) => ({
        id: crypto.randomUUID(),
        buildId,
        kind,
        status: "queued",
        manual: isManualBuildKind(kind),
        updatedAt: createdAt,
      })),
    };
    this.state.builds.push(build);
    return { build: structuredClone(build), created: true };
  }

  async getForBusiness(businessId: string): Promise<Build | null> {
    const build = this.state.builds.find(
      (candidate) => candidate.businessId === businessId,
    );
    return build ? structuredClone(build) : null;
  }

  async list(): Promise<Build[]> {
    return [...this.state.builds]
      .reverse()
      .map((build) => structuredClone(build));
  }

  async setItemStatus(
    buildId: string,
    kind: BuildItemKind,
    status: BuildItemStatus,
    note?: string,
  ): Promise<Build> {
    const build = this.state.builds.find((candidate) => candidate.id === buildId);
    if (!build) throw new BusinessNotFoundError(buildId);
    const item = build.items.find((candidate) => candidate.kind === kind);
    if (!item) throw new BusinessNotFoundError(`${buildId}/${kind}`);
    assertBuildItemTransition(item.status, status);
    item.status = status;
    item.updatedAt = nowIso();
    if (note !== undefined) item.note = note;
    return structuredClone(build);
  }
}

class MemoryArtifactRepository implements ArtifactRepository {
  constructor(private readonly state: MemoryState) {}

  private ofKind(businessId: string, kind: ArtifactKind): ArtifactRecord[] {
    return this.state.artifacts.filter(
      (artifact) => artifact.businessId === businessId && artifact.kind === kind,
    );
  }

  async save<T>(input: SaveArtifactInput<T>): Promise<ArtifactRecord<T>> {
    if (!this.state.businesses.has(input.businessId)) {
      throw new BusinessNotFoundError(input.businessId);
    }
    const existing = this.ofKind(input.businessId, input.kind);
    const record: ArtifactRecord<T> = {
      id: crypto.randomUUID(),
      businessId: input.businessId,
      kind: input.kind,
      version: existing.length
        ? Math.max(...existing.map((artifact) => artifact.version)) + 1
        : 1,
      payload: structuredClone(input.payload),
      ...(input.meta ? { meta: structuredClone(input.meta) } : {}),
      createdAt: nowIso(),
    };
    this.state.artifacts.push(record as ArtifactRecord);
    return structuredClone(record);
  }

  async latest<T>(
    businessId: string,
    kind: ArtifactKind,
  ): Promise<ArtifactRecord<T> | null> {
    const all = this.ofKind(businessId, kind);
    if (all.length === 0) return null;
    const top = all.reduce((a, b) => (a.version > b.version ? a : b));
    return structuredClone(top) as ArtifactRecord<T>;
  }

  async getVersion<T>(
    businessId: string,
    kind: ArtifactKind,
    version: number,
  ): Promise<ArtifactRecord<T> | null> {
    const match = this.ofKind(businessId, kind).find(
      (artifact) => artifact.version === version,
    );
    return match ? (structuredClone(match) as ArtifactRecord<T>) : null;
  }

  async listVersions(
    businessId: string,
    kind: ArtifactKind,
  ): Promise<ArtifactRecord[]> {
    return this.ofKind(businessId, kind)
      .sort((a, b) => b.version - a.version)
      .map((artifact) => structuredClone(artifact));
  }
}

/** A fresh, isolated in-memory spine (each call is its own universe). */
export function createMemoryBusinessSpine(): BusinessSpineRepositories {
  const state: MemoryState = {
    businesses: new Map(),
    artifacts: [],
    activity: [],
    builds: [],
    sequence: new Map(),
    nextSequence: 1,
  };
  return {
    businesses: new MemoryBusinessRepository(state),
    artifacts: new MemoryArtifactRepository(state),
    activity: new MemoryActivityRepository(state),
    builds: new MemoryBuildRepository(state),
  };
}
