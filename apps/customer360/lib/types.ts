/**
 * Customer360 domain types, shaped by this domain's own Go service.
 * No other application imports these - they are internal to Customer360.
 */

export type CustomerStatus = "active" | "suspended" | "closed";
export type PlanType = "prepaid" | "postpaid";

export interface CustomerSummary {
  id: string;
  fullName: string;
  msisdn: string;
  accountNumber: string;
  planType: PlanType;
  status: CustomerStatus;
}

export interface CustomerDetail extends CustomerSummary {
  email: string | null;
  segment: string | null;
  balance: number | null;
  joinedAt: string | null;
}

export interface CustomerInteraction {
  id: string;
  customerId: string;
  channel: InteractionChannel;
  subject: string;
  note: string;
  createdAt: string;
  agentName: string | null;
}

export type InteractionChannel = "call" | "chat" | "email" | "visit";

/** Presentation mapping lives in the domain, never in @repo/ui. */
export function statusTone(status: CustomerStatus): "success" | "warning" | "neutral" {
  switch (status) {
    case "active":
      return "success";
    case "suspended":
      return "warning";
    case "closed":
      return "neutral";
  }
}
