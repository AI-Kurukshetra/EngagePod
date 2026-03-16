import { LibraryPageContent } from "@/components/dashboard/library-page-content";
import { getDashboardSnapshot } from "@/lib/platform-data";

export default async function LibraryPage() {
  const snapshot = await getDashboardSnapshot();
  return <LibraryPageContent snapshot={snapshot} />;
}
