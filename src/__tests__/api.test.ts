import { describe, expect, it } from "vitest";
import { apiBadRequest, apiForbidden, apiNotFound, apiOk, apiServerError, apiUnauthorized } from "@/lib/api";

describe("api response helpers", () => {
  it("creates success responses", async () => {
    const response = apiOk({ status: "ok" });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
  });

  it("creates bad request responses", async () => {
    const response = apiBadRequest("Nope");
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Nope");
  });

  it("creates auth and server error responses", async () => {
    const unauthorized = apiUnauthorized();
    const forbidden = apiForbidden();
    const notFound = apiNotFound();
    const serverError = apiServerError();

    expect(unauthorized.status).toBe(401);
    expect(forbidden.status).toBe(403);
    expect(notFound.status).toBe(404);
    expect(serverError.status).toBe(500);
  });
});
