import { apiOk } from "@/lib/api";
import { getApiPayload } from "@/lib/platform-data";

export async function GET() {
  const payload = await getApiPayload();
  return apiOk(payload.activities);
}
