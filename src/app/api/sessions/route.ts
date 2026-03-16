import { apiBadRequest, apiOk } from "@/lib/api";
import { getDashboardSnapshot } from "@/lib/platform-data";
import { launchSessionSchema } from "@/lib/validation/schemas";

export async function GET() {
  const snapshot = await getDashboardSnapshot();
  return apiOk(snapshot.sessions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = launchSessionSchema.safeParse(body);

  if (!parsed.success) {
    return apiBadRequest(parsed.error.issues[0]?.message ?? "Invalid session payload.");
  }

  return apiOk({
    id: crypto.randomUUID(),
    status: "scheduled",
    ...parsed.data,
  });
}
