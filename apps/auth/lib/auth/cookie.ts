import "server-only";

import { NextResponse } from "next/server";

import { sessionCookie } from "../config";

/**
 * The two cookie operations the platform has. Every other application only ever
 * reads the cookie, so the attributes below are defined exactly once.
 */

export function issueSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({ ...sessionCookie, value: token });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({ ...sessionCookie, value: "", maxAge: 0 });
}
