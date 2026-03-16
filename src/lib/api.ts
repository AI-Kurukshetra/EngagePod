import { NextResponse } from "next/server";

export function apiOk<T>(data: T) {
  return NextResponse.json({ ok: true, data });
}

export function apiBadRequest(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

export function apiUnauthorized(message = "You must be signed in to continue.") {
  return NextResponse.json({ ok: false, error: message }, { status: 401 });
}

export function apiForbidden(message = "You do not have permission to perform this action.") {
  return NextResponse.json({ ok: false, error: message }, { status: 403 });
}

export function apiNotFound(message = "The requested record was not found.") {
  return NextResponse.json({ ok: false, error: message }, { status: 404 });
}

export function apiServerError(message = "Something went wrong while processing the request.") {
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}
