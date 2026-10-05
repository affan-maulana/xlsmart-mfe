import type { SessionUser } from "./types";

/**
 * Shared business-neutral staff metadata.
 *
 * These placeholders live in exactly one place until the identity service
 * supplies real values per user. Applications read them off the session user -
 * never from local constants.
 */
export const STAFF_METADATA = {
  staffId: "CRR-2321708",
  locationName: "Jakarta — XL Center",
} as const;

/**
 * Data mapper: raw GET /auth/api/session body → typed SessionUser.
 *
 * Prefers fields the identity service already provides and falls back to the
 * shared metadata, so chrome renders consistently while the service catches
 * up. Unknown fields are ignored - the contract is closed on purpose.
 */
export function mapSessionUser(raw: unknown): SessionUser {
  const input = (raw ?? {}) as Record<string, unknown>;

  const user: SessionUser = {
    id: asString(input.id) ?? "",
    name: asString(input.name) ?? "",
    email: asString(input.email) ?? "",
    role: asString(input.role) ?? "agent",
    staffId: asString(input.staffId) ?? STAFF_METADATA.staffId,
    locationName: asString(input.locationName) ?? STAFF_METADATA.locationName,
  };

  const branchCode = asString(input.branchCode);
  if (branchCode) user.branchCode = branchCode;

  if (Array.isArray(input.permissions)) {
    user.permissions = input.permissions.filter(
      (value): value is string => typeof value === "string",
    );
  }

  return user;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
