import type { Metadata } from "next";
import { CompanyAboutPage } from "@/features/company-site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "About",
  description:
    "TITAN is a growth platform for UK trade businesses — what it is, where " +
    "it is up to, and the rules it works by.",
};

export default function Page() {
  return <CompanyAboutPage />;
}
