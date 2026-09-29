import "server-only";

import { bffFetch } from "../http";
import type { MigrationDetail, MigrationRequest } from "../types";

/** PreToPost server data access. */

export async function listMigrations(): Promise<MigrationRequest[]> {
  const response = await bffFetch<{ requests: MigrationRequest[] }>({ path: "/v1/migrations" });
  return response.requests ?? [];
}

export async function getMigration(id: string): Promise<MigrationDetail | null> {
  try {
    return await bffFetch<MigrationDetail>({ path: `/v1/migrations/${encodeURIComponent(id)}` });
  } catch (error) {
    if (error instanceof Error && error.message === "Not found.") return null;
    throw error;
  }
}

export async function createMigration(input: unknown): Promise<MigrationRequest> {
  return bffFetch<MigrationRequest>({ path: "/v1/migrations", method: "POST", body: input });
}

export async function decideMigration(
  id: string,
  decision: string,
  note: string,
): Promise<MigrationDetail> {
  return bffFetch<MigrationDetail>({
    path: `/v1/migrations/${encodeURIComponent(id)}/decision`,
    method: "POST",
    body: { decision, note },
  });
}
