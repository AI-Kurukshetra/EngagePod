import { HomepageV2 } from "@/components/dashboard/homepage-v2";
import { getDashboardSnapshot } from "@/lib/platform-data";

export default async function Home() {
  const snapshot = await getDashboardSnapshot();

  return <HomepageV2 snapshot={snapshot} />;
}
