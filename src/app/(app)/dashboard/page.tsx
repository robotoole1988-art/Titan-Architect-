import { LayoutDashboard } from "lucide-react";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <PagePlaceholder
      title="Dashboard"
      description="Overview of the TITAN ecosystem."
      icon={LayoutDashboard}
    />
  );
}
