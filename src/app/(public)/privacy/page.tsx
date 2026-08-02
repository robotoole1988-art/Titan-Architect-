import type { Metadata } from "next";
import { CompanyPrivacyPage } from "@/features/company-site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What titan-architect.vercel.app does with your data: no analytics, no " +
    "cookies, no contact form.",
};

export default function Page() {
  return <CompanyPrivacyPage />;
}
