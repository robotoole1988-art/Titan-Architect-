import type { Metadata } from "next";
import { CompanyAdvertisingPage } from "@/features/company-site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Advertising",
  description:
    "How TITAN plans, builds and manages Google Ads campaigns for UK trade " +
    "businesses — whose account holds them, whose money is spent, and what a " +
    "person decides.",
};

export default function Page() {
  return <CompanyAdvertisingPage />;
}
