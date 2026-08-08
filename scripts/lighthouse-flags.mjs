/**
 * What the Performance Law refuses to measure, and how to say so to
 * Lighthouse correctly (ADR-055, ADR-071).
 *
 * This lives in its own module for one reason: the way you pass these
 * patterns to Lighthouse was silently wrong for weeks, and a bug that
 * silent deserves a test, which means it needs something importable.
 *
 * ## The bug, so nobody reintroduces it
 *
 * The gate used to build the flag by joining the patterns with commas:
 *
 *     `--blocked-url-patterns=${NOT_THE_PRODUCT.join(",")}`
 *
 * Lighthouse's CLI parses `blocked-url-patterns` as a yargs ARRAY, and yargs
 * does not split an array value on commas. Verified by running Lighthouse 12
 * and reading `configSettings.blockedUrlPatterns` back out of the report:
 *
 *     ["*vercel.live*,*vercel-scripts.com*,*vercel.com/api*"]
 *
 * One literal pattern, containing commas, matching no URL that exists. The
 * flag has to be REPEATED, once per pattern, which parses to three real
 * patterns. Nothing warned about this: the run succeeded, the report looked
 * plausible, and the Vercel preview toolbar was scored as if it were TITAN's
 * product on every preview run — worth roughly 1,200ms of blocking time and
 * 27 points of performance score against a page that measures 99 in
 * production.
 */

/**
 * Vercel injects its preview toolbar (comments, feedback) from vercel.live
 * into every PREVIEW deployment. It is not part of the product and the
 * customer never downloads it, but Lighthouse counts every byte and every
 * millisecond of it.
 *
 * (Disabling Preview Comments on the Vercel project would remove it at
 * source. Blocking is kept as well, because the law should not depend on a
 * dashboard setting nobody can see in a diff.)
 */
export const NOT_THE_PRODUCT = [
  "*vercel.live*",
  "*vercel-scripts.com*",
  "*vercel.com/api*",
];

/**
 * One `--blocked-url-patterns` flag PER pattern. Never comma-joined.
 *
 * @param {readonly string[]} patterns
 * @returns {string[]} argv fragments, ready to spread
 */
export function blockedUrlPatternFlags(patterns = NOT_THE_PRODUCT) {
  return patterns.map((pattern) => `--blocked-url-patterns=${pattern}`);
}

/**
 * Prove Lighthouse applied what we asked for, from the report itself.
 *
 * This is the part that makes the fix permanent. The flag syntax is an
 * assumption about someone else's CLI, and assumptions about other people's
 * CLIs go stale. Rather than trusting the syntax, the gate reads
 * `configSettings.blockedUrlPatterns` out of every run and refuses the
 * measurement if a pattern it asked for is not there — so the next time this
 * breaks, it breaks loudly on the first run instead of quietly for weeks.
 *
 * @param {unknown} applied  lhr.configSettings.blockedUrlPatterns
 * @param {readonly string[]} requested
 * @returns {string|null} an error sentence, or null when satisfied
 */
export function blockedPatternsProblem(applied, requested = NOT_THE_PRODUCT) {
  if (!Array.isArray(applied)) {
    return (
      `Lighthouse reported no blocked-url-patterns at all. The gate cannot ` +
      `prove it measured the product rather than the preview toolbar.`
    );
  }
  const missing = requested.filter((pattern) => !applied.includes(pattern));
  if (missing.length === 0) return null;
  return (
    `Lighthouse did not apply every pattern the gate asked for.\n` +
    `  requested: ${JSON.stringify(requested)}\n` +
    `  applied:   ${JSON.stringify(applied)}\n` +
    `  missing:   ${JSON.stringify(missing)}\n` +
    `  A comma-joined --blocked-url-patterns value parses as ONE literal ` +
    `pattern and blocks nothing; the flag must be repeated per pattern.`
  );
}
