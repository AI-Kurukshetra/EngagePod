import { apiBadRequest, apiOk } from "@/lib/api";
import { getDashboardSnapshot } from "@/lib/platform-data";
import { createLessonSchema } from "@/lib/validation/schemas";

export async function GET() {
  const snapshot = await getDashboardSnapshot();
  return apiOk(snapshot.lessons);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createLessonSchema.safeParse(body);

  if (!parsed.success) {
    return apiBadRequest(parsed.error.issues[0]?.message ?? "Invalid lesson payload.");
  }

  return apiOk({
    id: crypto.randomUUID(),
    ...parsed.data,
    status: "draft",
  });
}
