import "server-only";

import { bffFetch } from "../http";
import type { QueueAggregates, QueueDetail, QueueSummaryInfo, QueueTicket } from "../types";

/** Queue's server data access - page rendering plus route handlers. */

export async function listQueues(): Promise<QueueSummaryInfo[]> {
  const response = await bffFetch<{ queues: QueueSummaryInfo[] }>({ path: "/v1/queues" });
  return response.queues ?? [];
}

export async function getQueue(id: string): Promise<QueueDetail | null> {
  try {
    return await bffFetch<QueueDetail>({ path: `/v1/queues/${encodeURIComponent(id)}` });
  } catch (error) {
    if (error instanceof Error && error.message === "Not found.") return null;
    throw error;
  }
}

export async function createQueue(input: {
  name: string;
  slaMinutes: number;
  priorityRouting: boolean;
}): Promise<QueueSummaryInfo> {
  return bffFetch<QueueSummaryInfo>({ path: "/v1/queues", method: "POST", body: input });
}

export async function changeQueueStatus(id: string, status: string): Promise<QueueDetail> {
  return bffFetch<QueueDetail>({
    path: `/v1/queues/${encodeURIComponent(id)}/status`,
    method: "PATCH",
    body: { status },
  });
}

export async function applyTicketAction(
  id: string,
  action: string,
  counter?: string,
): Promise<QueueTicket[]> {
  const response = await bffFetch<{ tickets: QueueTicket[] }>({
    path: `/v1/queues/${encodeURIComponent(id)}/tickets/actions`,
    method: "POST",
    body: counter ? { action, counter } : { action },
  });
  return response.tickets ?? [];
}

/**
 * Aggregates for the published summary contract. Computed from the domain's own
 * data so the shell can render a widget without knowing anything about queues.
 */
export async function getQueueAggregates(): Promise<QueueAggregates> {
  const queues = await listQueues();
  const active = queues.filter((queue) => queue.status !== "closed");

  return {
    activeQueues: active.length,
    waitingCustomers: sumBy(active, (queue) => queue.waitingCount),
    longestWaitMinutes: active.reduce((longest, queue) => Math.max(longest, queue.longestWaitMinutes), 0),
    servedLastHour: sumBy(active, (queue) => queue.servedLastHour),
    generatedAt: new Date().toISOString(),
  };
}

function sumBy<T>(items: T[], value: (item: T) => number): number {
  return items.reduce((total, item) => total + value(item), 0);
}
