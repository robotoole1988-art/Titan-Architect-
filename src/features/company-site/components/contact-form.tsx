import { TRADE_TAXONOMY } from "@/core/trade-taxonomy";
import { submitCompanyContact } from "../api/contact-action";
import { CONTACT_EMAIL } from "../model/facts";

/**
 * The contact form (ADR-064 fix wave): TITAN's own enquiry capture on
 * TITAN's own site. Server-rendered, zero client JavaScript — native HTML
 * validation does the human-facing checks, the server action does the
 * rest. The trade select submits canonical taxonomy ids, so a submission
 * arrives in the CRM already classified, with the knowledge panel lit.
 */

const FIELD =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-[0.95rem] text-white placeholder:text-white/50 focus:border-amber-300/60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300/70";

const LABEL = "text-xs font-medium uppercase tracking-[0.14em] text-white/60";

export function ContactForm() {
  return (
    <form action={submitCompanyContact} className="mt-9">
      {/* Honeypot: humans never see it, bots fill it, drops are silent. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label>
          Leave this field empty
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={LABEL}>Your name</span>
          <input name="name" required maxLength={120} autoComplete="name" className={FIELD} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={LABEL}>Business name</span>
          <input name="business" required maxLength={160} autoComplete="organization" className={FIELD} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={LABEL}>Trade</span>
          <select name="tradeId" required defaultValue="" className={FIELD}>
            <option value="" disabled>
              Choose your trade
            </option>
            {TRADE_TAXONOMY.map((trade) => (
              <option key={trade.id} value={trade.id}>
                {trade.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className={LABEL}>Town or area you work</span>
          <input name="town" required maxLength={90} className={FIELD} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={LABEL}>Email</span>
          <input name="email" type="email" required maxLength={200} autoComplete="email" className={FIELD} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={LABEL}>Phone (optional)</span>
          <input name="phone" type="tel" maxLength={40} autoComplete="tel" className={FIELD} />
        </label>
      </div>
      <label className="mt-5 flex flex-col gap-2">
        <span className={LABEL}>What do you need?</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          placeholder="What you do, where you work, and what is not working today."
          className={FIELD}
        />
      </label>

      <div className="mt-7 flex flex-wrap items-center gap-5">
        <button
          type="submit"
          className="rounded-full bg-amber-300 px-7 py-3 text-sm font-semibold text-[#0b0803] transition-colors hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300/70"
        >
          Send it
        </button>
        <p className="text-sm text-white/55">
          Goes straight into TITAN — the same enquiry capture your site would
          get. A person replies, not a sequence.
        </p>
      </div>
      <p className="mt-5 text-sm text-white/55">
        Prefer email?{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-amber-200/80 underline underline-offset-4 hover:text-amber-100"
        >
          Write to us directly
        </a>
        .
      </p>
    </form>
  );
}
