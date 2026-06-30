import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CodexStatus } from "../model/types";

const STATUS_STYLES: Record<CodexStatus, string> = {
  Draft: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Approved:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Deprecated:
    "border-zinc-500/30 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
};

export function CodexStatusBadge({ status }: { status: CodexStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}
