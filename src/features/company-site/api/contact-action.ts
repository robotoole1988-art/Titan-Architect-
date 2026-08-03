"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { resolveBusinessSpine } from "@/core/business";
import { createRateLimiter } from "@/lib/rate-limit";
import { processCompanyContact } from "./contact";

/**
 * The contact form's server action — thin, like every action in this
 * codebase: read the request, hand to the logic, redirect.
 *
 * Failure UX under the no-client-JS law: native HTML validation (required,
 * type=email, minlength) is the human-facing layer, so a submission that
 * still fails server validation is a bypass, not a person — it is turned
 * around silently. Rate-limited callers get the same treatment. Nobody
 * builds an error console for bots.
 */

const limiter = createRateLimiter({ windowMs: 10 * 60_000, max: 5 });

export async function submitCompanyContact(formData: FormData): Promise<void> {
  const requestHeaders = await headers();
  const clientKey =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!limiter.allow(clientKey)) redirect("/#contact");

  const field = (key: string): string => String(formData.get(key) ?? "");
  const spine = await resolveBusinessSpine();
  const result = await processCompanyContact(spine, {
    name: field("name"),
    business: field("business"),
    tradeId: field("tradeId"),
    town: field("town"),
    email: field("email"),
    phone: field("phone"),
    message: field("message"),
    website: field("website"),
  });

  if (!result.ok) redirect("/#contact");
  redirect("/thanks");
}
