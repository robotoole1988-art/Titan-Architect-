import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

/**
 * Shared empty-state used by every placeholder page. Keeps all the pages
 * consistent and DRY — when real content is built, a page simply stops
 * rendering this and renders its feature instead.
 */
export function PagePlaceholder({
  title,
  description,
  icon: Icon,
}: PagePlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </header>

      <Card className="flex-1 border-dashed bg-card/40">
        <CardContent className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border bg-muted/40">
            <Icon className="size-7 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Foundation ready</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              This is a placeholder for {title}. No features have been built
              yet — the structure is in place and ready for development.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
