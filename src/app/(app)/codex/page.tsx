import { BookText } from "lucide-react";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "Codex" };

export default function CodexPage() {
  return (
    <PagePlaceholder
      title="Codex"
      description="Company knowledge and intellectual property."
      icon={BookText}
    />
  );
}
