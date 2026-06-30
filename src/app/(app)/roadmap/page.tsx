import { Map } from "lucide-react";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "Roadmap" };

export default function RoadmapPage() {
  return (
    <PagePlaceholder
      title="Roadmap"
      description="What TITAN is building next."
      icon={Map}
    />
  );
}
