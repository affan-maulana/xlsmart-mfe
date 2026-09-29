/**
 * PreToPost domain types. Prepaid/postpaid conversion logic lives here and only
 * here - the shell and the other domains cannot reach it.
 */

export type MigrationStatus =
  | "draft"
  | "pending-review"
  | "approved"
  | "rejected"
  | "completed";

export type MigrationDirection = "prepaid-to-postpaid" | "postpaid-to-prepaid";

export interface MigrationRequest {
  id: string;
  reference: string;
  msisdn: string;
  customerName: string;
  direction: MigrationDirection;
  targetPlan: string;
  status: MigrationStatus;
  requestedBy: string;
  requestedAt: string;
}

export interface MigrationDetail extends MigrationRequest {
  reason: string;
  depositAmount: number | null;
  creditCheckRequired: boolean;
  timeline: MigrationTimelineEntry[];
}

export interface MigrationTimelineEntry {
  id: string;
  at: string;
  label: string;
  actor: string | null;
}

export function migrationStatusTone(
  status: MigrationStatus,
): "neutral" | "info" | "warning" | "success" | "danger" {
  switch (status) {
    case "draft":
      return "neutral";
    case "pending-review":
      return "warning";
    case "approved":
      return "info";
    case "completed":
      return "success";
    case "rejected":
      return "danger";
  }
}
