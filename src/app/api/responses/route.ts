import { apiBadRequest, apiOk } from "@/lib/api";
import { getApiPayload } from "@/lib/platform-data";
import { submitResponseSchema } from "@/lib/validation/schemas";

export async function GET() {
  const payload = await getApiPayload();
  return apiOk(payload.responses);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = submitResponseSchema.safeParse(body);

  if (!parsed.success) {
    return apiBadRequest(parsed.error.issues[0]?.message ?? "Invalid response payload.");
  }

  return apiOk({
    accepted: true,
    responseId: crypto.randomUUID(),
    ...parsed.data,
  });
}
