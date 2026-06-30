import { FileText } from "lucide-react";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "PRDs" };

export default function PrdsPage() {
  return (
    <PagePlaceholder
      title="PRDs"
      description="Product requirement documents."
      icon={FileText}
    />
  );
}
