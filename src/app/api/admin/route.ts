import { apiOk } from "@/lib/api";
import { getDashboardSnapshot } from "@/lib/platform-data";

export async function GET() {
  const snapshot = await getDashboardSnapshot();
  return apiOk({
    school: snapshot.schools[0] ?? null,
    integrations: snapshot.integrations,
    notifications: snapshot.notifications,
  });
}
