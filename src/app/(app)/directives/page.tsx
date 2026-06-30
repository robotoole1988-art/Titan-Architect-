import { Target } from "lucide-react";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "Directives" };

export default function DirectivesPage() {
  return (
    <PagePlaceholder
      title="Directives"
      description="Strategic build directives that guide development."
      icon={Target}
    />
  );
}
