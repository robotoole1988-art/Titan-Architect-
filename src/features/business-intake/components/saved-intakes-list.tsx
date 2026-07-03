import Link from "next/link";
import { ArrowRight, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { resolveBusinessSpine, type Business } from "@/core/business";
import { removeBusiness } from "../api/actions";
import { formatDate } from "../model/format";

/**
 * The saved businesses (server-rendered from the Business Spine). Each entry
 * links onward into its journey — Generate Strategy resolves the STORED
 * record by id (ADR-023 evolution of the ADR-019 URL boundary).
 */
function BusinessRow({ business }: { business: Business }) {
  return (
    <li
      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/40 p-4"
      data-business-id={business.id}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{business.name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {business.trade} · {business.location}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[11px] capitalize text-emerald-300/90">
          {business.stage}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {business.goal && (
          <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground">
            {business.goal}
          </span>
        )}
        {business.budget && (
          <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground">
            {business.budget}
          </span>
        )}
        <span className="text-[11px] text-muted-foreground">
          {formatDate(business.createdAt)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            render={<Link href={`/experience-studio?businessId=${business.id}`} />}
            className="gap-1.5"
          >
            Generate Strategy
            <ArrowRight className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/businesses/${business.id}`} />}
            className="gap-1.5"
          >
            <Route className="size-3.5" />
            Journey
          </Button>
        </div>
        <form
          action={async () => {
            "use server";
            await removeBusiness(business.id);
          }}
        >
          <Button size="sm" variant="ghost" type="submit">
            Remove
          </Button>
        </form>
      </div>
    </li>
  );
}

export async function SavedIntakesList() {
  const spine = await resolveBusinessSpine();
  const businesses = await spine.businesses.list();

  if (businesses.length === 0) {
    return (
      <Card className="border-border/60 bg-card/40 backdrop-blur-xl">
        <CardContent className="py-6 text-sm text-muted-foreground">
          No businesses yet — save an intake and it becomes the first Business
          record in the pipeline.
        </CardContent>
      </Card>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {businesses.map((business) => (
        <BusinessRow key={business.id} business={business} />
      ))}
    </ul>
  );
}
