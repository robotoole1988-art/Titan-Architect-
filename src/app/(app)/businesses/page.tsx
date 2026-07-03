import { BusinessesPage } from "@/features/businesses";

export const metadata = { title: "Businesses" };

/** Thin route: the pipeline list lives in the feature. */
export default function Page() {
  return <BusinessesPage />;
}
