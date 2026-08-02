import Link from "next/link";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Publication } from "@/core/business";
import { unpublishBusinessSite } from "../api/actions";

/**
 * The live-site panel: publication state and the takedown control.
 *
 * This lives on the business DETAIL page — the one page every business has
 * at every stage — because a publication can exist at any stage: publishing
 * does not require the stage to move. The Accounts page only lists
 * live/account businesses, so before this panel existed a site published
 * from a `lead` record was publicly serving with no control anywhere in the
 * app that could take it down. Takedown must never depend on a CRM stage:
 * where a publication exists, so does the off switch.
 */
export function SitePanel({
  businessId,
  publication,
}: {
  businessId: string;
  publication: Publication | null;
}) {
  return (
    <section
      aria-label="Live site"
      className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/40 p-5"
      data-site-panel
    >
      <h2 className="text-sm font-semibold">Live site</h2>
      {publication ? (
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              render={
                <Link href={`/sites/${publication.slug}`} target="_blank" />
              }
              className="gap-1.5"
              data-live-site-link
            >
              <Globe className="size-3.5" />
              /sites/{publication.slug} · v{publication.version}
            </Button>
            <form
              action={async () => {
                "use server";
                await unpublishBusinessSite(businessId);
              }}
            >
              <Button size="sm" variant="outline" type="submit">
                Unpublish
              </Button>
            </form>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Serving since{" "}
            {new Date(publication.statusChangedAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
            {" · "}Unpublish takes it off the internet immediately.
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
          Nothing is live — this business has no public site serving. Going
          live from the Build Queue publishes one.
        </p>
      )}
    </section>
  );
}
