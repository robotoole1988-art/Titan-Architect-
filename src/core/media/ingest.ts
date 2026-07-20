/**
 * Customer image ingestion (ADR-053): the business's OWN photographs enter
 * the same pipeline as generated media — same storage, same LQIP variant,
 * same founder review gate before anything ships. Provenance is honest:
 * provider "customer-upload", model "original-photograph", cost 0.
 */

import type { Business, BusinessSpineRepositories, MediaRecord } from "@/core/business";
import { createLqip } from "./lqip";
import type { MediaStorage } from "./generate";

/** Providers whose assets are the business's own (not generated). */
export const CUSTOMER_UPLOAD_PROVIDER = "customer-upload";

/** Accepted upload formats, normalised (jpg → jpeg). */
const ACCEPTED_FORMATS = new Set(["webp", "jpeg", "png"]);

/** Basic sanity ceiling for a photograph upload. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export interface CustomerImageInput {
  /** The blueprint slot this photo should dress. */
  slotRef: string;
  bytes: Uint8Array;
  /** File format/extension as supplied ("jpg", "jpeg", "png", "webp"). */
  format: string;
  /** Optional founder note (what the photo shows) — stored as the brief. */
  note?: string;
}

export type IngestResult =
  | { ok: true; record: MediaRecord }
  | { ok: false; problems: string[] };

/** "image/jpeg" | "jpg" | "JPEG" → "jpeg"; unknown → "" (rejected). */
export function normaliseImageFormat(format: string): string {
  const bare = format.trim().toLowerCase().replace(/^image\//, "");
  const mapped = bare === "jpg" ? "jpeg" : bare;
  return ACCEPTED_FORMATS.has(mapped) ? mapped : "";
}

/**
 * Validate → derive variants (dimensions + LQIP, the pipeline's standard) →
 * store → MediaRecord born in REVIEW. Never silently accepts a bad file;
 * never bypasses the gate.
 */
export async function ingestCustomerImage(
  spine: BusinessSpineRepositories,
  storage: MediaStorage,
  business: Business,
  input: CustomerImageInput,
): Promise<IngestResult> {
  const problems: string[] = [];
  const format = normaliseImageFormat(input.format);
  const slotRef = input.slotRef.trim();
  if (!slotRef) problems.push("Choose which slot the photo is for.");
  if (!format) {
    problems.push(
      `Unsupported format "${input.format}" — use webp, jpeg, or png.`,
    );
  }
  if (input.bytes.length === 0) problems.push("The file is empty.");
  if (input.bytes.length > MAX_UPLOAD_BYTES) {
    problems.push(
      `The file is ${(input.bytes.length / (1024 * 1024)).toFixed(1)}MB — the limit is ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB.`,
    );
  }
  if (problems.length > 0) return { ok: false, problems };

  // Dimensions via the pipeline's own sharp path — and a real decode check:
  // bytes that sharp cannot read are not an image, whatever the extension.
  let width: number | undefined;
  let height: number | undefined;
  try {
    const { default: sharp } = await import("sharp");
    const meta = await sharp(Buffer.from(input.bytes)).metadata();
    width = meta.width;
    height = meta.height;
    if (!width || !height) throw new Error("no dimensions");
  } catch {
    return {
      ok: false,
      problems: ["The file could not be read as an image."],
    };
  }

  const lqip = await createLqip(Buffer.from(input.bytes));
  // A distinct storage path per upload — customer photos never overwrite
  // generated takes (or earlier uploads) for the same slot.
  const existing = await spine.media.listForBusiness(business.id);
  const uploadCount = existing.filter(
    (record) =>
      record.slotRef === slotRef &&
      record.provenance.provider === CUSTOMER_UPLOAD_PROVIDER,
  ).length;
  const stored = await storage.save(
    business.id,
    `${slotRef}.customer-${uploadCount + 1}`,
    input.bytes,
    format,
  );

  const record = await spine.media.create({
    businessId: business.id,
    slotRef,
    brief: input.note?.trim() || "Customer-supplied photograph",
    modality: "image",
    url: stored.url,
    ...(lqip ? { lqip } : {}),
    width,
    height,
    provenance: {
      provider: CUSTOMER_UPLOAD_PROVIDER,
      model: "original-photograph",
      prompt: input.note?.trim() || "Uploaded by the founder from the business's own photos",
      costUsd: 0,
      generatedAt: new Date().toISOString(),
    },
  });
  return { ok: true, record };
}
