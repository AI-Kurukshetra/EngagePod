import { apiOk } from "@/lib/api";
import { buildLessonCoverage, buildMetricCards, buildRiskDistribution } from "@/lib/analytics";
import { getDashboardSnapshot } from "@/lib/platform-data";

export async function GET() {
  const snapshot = await getDashboardSnapshot();
  return apiOk({
    metrics: buildMetricCards(snapshot),
    risk: buildRiskDistribution(snapshot),
    coverage: buildLessonCoverage(snapshot),
  });
}
