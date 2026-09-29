/**
 * Queue domain types, shaped by this domain's own Go service.
 * Queue remains the owner of queue data and queue rules.
 */

export type QueueStatus = "open" | "paused" | "closed";
export type TicketStatus = "waiting" | "called" | "served" | "no-show";

export interface QueueSummaryInfo {
  id: string;
  name: string;
  status: QueueStatus;
  waitingCount: number;
  servedLastHour: number;
  longestWaitMinutes: number;
  counters: string[];
}

export interface QueueTicket {
  id: string;
  reference: string;
  position: number;
  status: TicketStatus;
  waitedMinutes: number;
  service: string;
  customerName: string | null;
}

export interface QueueDetail extends QueueSummaryInfo {
  slaMinutes: number;
  priorityRouting: boolean;
  tickets: QueueTicket[];
}

/** The published cross-application contract, consumed by the shell widget. */
export interface QueueAggregates {
  activeQueues: number;
  waitingCustomers: number;
  longestWaitMinutes: number;
  servedLastHour: number;
  generatedAt: string;
}

/** Presentation mapping lives in the domain, never in @repo/ui. */
export function queueStatusTone(status: QueueStatus): "success" | "warning" | "neutral" {
  switch (status) {
    case "open":
      return "success";
    case "paused":
      return "warning";
    case "closed":
      return "neutral";
  }
}

export function ticketStatusTone(status: TicketStatus): "info" | "warning" | "success" | "danger" {
  switch (status) {
    case "waiting":
      return "warning";
    case "called":
      return "info";
    case "served":
      return "success";
    case "no-show":
      return "danger";
  }
}
