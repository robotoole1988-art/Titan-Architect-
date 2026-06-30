import { Boxes } from "lucide-react";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "Architecture" };

export default function ArchitecturePage() {
  return (
    <PagePlaceholder
      title="Architecture"
      description="System design and structure of the platform."
      icon={Boxes}
    />
  );
}
