/**
 * LQIP — the low-quality image placeholder (ADR-033/034 polish).
 *
 * A cold image-optimizer cache means seconds of "designed gradient" where a
 * photograph belongs — which reads as an unwired slot to a reviewer. Every
 * generated asset therefore carries a ~1KB blurred micro-preview inlined on
 * its MediaRecord; the renderer paints it instantly under the real image.
 *
 * Best-effort by design: sharp ships with Next, but if it is ever missing
 * or the bytes are not an image, the record simply has no lqip (the themed
 * gradient remains the fallback) — generation must never fail over a
 * placeholder.
 */

const LQIP_WIDTH = 16;

export async function createLqip(
  bytes: ArrayBuffer | Buffer,
): Promise<string | undefined> {
  try {
    const { default: sharp } = await import("sharp");
    const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
    const preview = await sharp(buffer)
      .resize(LQIP_WIDTH, undefined, { fit: "inside" })
      .blur(1)
      .webp({ quality: 30 })
      .toBuffer();
    return `data:image/webp;base64,${preview.toString("base64")}`;
  } catch {
    return undefined;
  }
}
