/**
 * The business identity seed (ADR-063).
 *
 * TITAN's variation had exactly one axis: the trade. Measured across the
 * whole taxonomy, 35 trades produced 7 distinct layouts and 7 themes — and
 * five roofers in three towns produced ONE. Same section order, same
 * palette, same headings, same headline with the town swapped. Two
 * competitors in the same town would have noticed before we did.
 *
 * The archetype axis is correct and stays: it decides what a page must DO,
 * and an emergency site should not look like a dental practice. What was
 * missing is a second axis — which of several equally valid ways this
 * particular business does it.
 *
 * The seed is DETERMINISTIC and derived from stable identity, so a site
 * never reshuffles itself. Regenerating a blueprint for the same business in
 * the same town returns byte-identical output; a different business in the
 * same trade lands somewhere else in the space.
 */

/** FNV-1a. Stable across runs and processes — no randomness anywhere. */
export function identitySeed(businessName: string, location: string): number {
  const text = `${businessName.trim().toLowerCase()}|${location.trim().toLowerCase()}`;
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 2147483647;
}

/**
 * Pick one option from a list, for a named axis.
 *
 * The axis name is mixed into the seed so two axes of the same length do not
 * move in lockstep — otherwise every business with palette 3 would also have
 * layout 3, collapsing the combinatorics back to a single dimension.
 */
export function pickFor<T>(seed: number, axis: string, options: ReadonlyArray<T>): T {
  if (options.length === 0) {
    throw new Error(`identity axis "${axis}" has no options to choose from`);
  }
  let mixed = seed;
  for (let index = 0; index < axis.length; index += 1) {
    mixed ^= axis.charCodeAt(index);
    mixed = Math.imul(mixed, 16777619);
  }
  return options[Math.abs(mixed) % options.length];
}

/**
 * The variation SLOTS the builder may choose from.
 *
 * Deliberately positional rather than named ("accent-3", not "ember"): core
 * must not import from the renderer, and the renderer owns what a slot means
 * inside each archetype's register — slot 3 is an ember orange on an
 * emergency site and a clay red on a premium one. `tests/features/website-
 * renderer/identity-variation.test.ts` asserts the renderer knows every slot
 * core can emit, which is how two layers stay in sync without a shared
 * import.
 */
export const ACCENT_REFS = [
  "accent-1",
  "accent-2",
  "accent-3",
  "accent-4",
  "accent-5",
  "accent-6",
] as const;

export const FORM_REFS = ["form-1", "form-2", "form-3", "form-4"] as const;
