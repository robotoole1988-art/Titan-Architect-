import { Bot } from "lucide-react";
import { PagePlaceholder } from "@/components/common/page-placeholder";

export const metadata = { title: "AI Employees" };

export default function AiEmployeesPage() {
  return (
    <PagePlaceholder
      title="AI Employees"
      description="The autonomous workforce that builds TITAN."
      icon={Bot}
    />
  );
}
