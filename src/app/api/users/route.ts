import { apiOk } from "@/lib/api";
import { getDashboardSnapshot } from "@/lib/platform-data";

export async function GET() {
  const snapshot = await getDashboardSnapshot();
  return apiOk(snapshot.schoolUsers);
}
