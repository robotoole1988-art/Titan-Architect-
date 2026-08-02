import { CompanyHomePage } from "@/features/company-site";

/**
 * "/" — TITAN's public front door (ADR-064).
 *
 * Static by construction: no session read, no database, nothing to
 * revalidate. The founder's Command Centre, which used to live here, moved
 * to `/command`.
 */
export const dynamic = "force-static";

export default function Page() {
  return <CompanyHomePage />;
}
