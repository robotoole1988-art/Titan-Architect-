import Link from "next/link";
import { CONTACT_EMAIL } from "../model/facts";
import { SiteFooter, SiteHeader } from "./chrome";

/**
 * The post-submission page. One promise, honestly scoped: a person reads
 * it. No "our team", no ticket numbers, no autoresponder theatre — TITAN
 * is one founder and the page says exactly what happens next.
 */
export function CompanyThanksPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="border-b border-white/[0.07]">
          <div className="mx-auto max-w-6xl px-6 pb-24 pt-24 sm:pb-32 sm:pt-32">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#8fb0e8]">
              Received
            </p>
            <h1 className="mt-7 max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
              Sent. A person reads this next.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/65">
              Your enquiry has landed in TITAN — the same capture your own
              site would get. Robert reads every one and replies himself,
              usually the same day. You will not be added to a mailing list.
            </p>
            <p className="mt-6 max-w-2xl text-[0.95rem] leading-relaxed text-white/55">
              Anything urgent in the meantime,{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[#9db9e8] underline underline-offset-4 hover:text-[#c3d9ff]"
              >
                email directly
              </a>
              .
            </p>
            <Link
              href="/"
              className="mt-10 inline-block rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/35 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7fa8ff]/70"
            >
              Back to the site
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
