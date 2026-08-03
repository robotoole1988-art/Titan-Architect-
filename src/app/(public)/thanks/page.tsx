import { CompanyThanksPage } from "@/features/company-site";

export const metadata = {
  title: "Sent — TITAN",
  robots: { index: false },
};

/** Thin route: the contact form's landing (ADR-064). Never indexed. */
export default function Page() {
  return <CompanyThanksPage />;
}
