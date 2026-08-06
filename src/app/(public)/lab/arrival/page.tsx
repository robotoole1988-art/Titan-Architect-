import { CompanyArrivalLabPage } from "@/features/company-site";

export const metadata = {
  title: "Lab — the arrival · TITAN",
  robots: { index: false },
};

/**
 * "/lab/arrival" — the flagship motion prototype (PRD-007 v2, Increment 1).
 *
 * Linked from nowhere, never indexed. It exists so the founder can judge
 * the proposed motion language with his eyes on a real deployment before
 * any of it touches the front page. Below the standard → deleted.
 */
export const dynamic = "force-static";

export default function Page() {
  return <CompanyArrivalLabPage />;
}
