import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DirectivePriority, DirectiveStatus } from "../model/types";

const STATUS_STYLES: Record<DirectiveStatus, string> = {
  Draft: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Approved:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "In Progress":
    "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  Completed:
    "border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400",
  Deprecated:
    "border-zinc-500/30 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
};

const PRIORITY_STYLES: Record<DirectivePriority, string> = {
  Low: "border-zinc-500/30 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
  Medium: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  High: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Critical:
    "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
};

export function DirectiveStatusBadge({ status }: { status: DirectiveStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}

export function DirectivePriorityBadge({
  priority,
}: {
  priority: DirectivePriority;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", PRIORITY_STYLES[priority])}
    >
      {priority}
    </Badge>
  );
}
