import "server-only";

import { headers } from "next/headers";

import { queueSummaryUrl } from "@/lib/config";

/**
 * The Queue Information Widget reads the Queue domain's published summary
 * contract over HTTP. Shell UI renders it; the Queue domain owns the numbers,
 * the rules behind them, and every action taken on a queue.
 *
 * Like the identity call, this relays the incoming `Cookie` header instead of
 * handling a token - the Queue BFF converts it to a Bearer header itself.
 */
export interface QueueSummary {
  activeQueues: number;
  waitingCustomers: number;
  longestWaitMinutes: number;
  servedLastHour: number;
  generatedAt: string;
}

export type QueueSummaryResult =
  | { ok: true; summary: QueueSummary }
  | { ok: false; reason: "unauthorized" | "unavailable" };

export async function fetchQueueSummary(): Promise<QueueSummaryResult> {
  const cookieHeader = (await headers()).get("cookie");
  if (!cookieHeader) return { ok: false, reason: "unauthorized" };

  try {
    const response = await fetch(queueSummaryUrl(), {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      return { ok: false, reason: "unauthorized" };
    }
    if (!response.ok) return { ok: false, reason: "unavailable" };

    const body = (await response.json()) as Partial<QueueSummary>;
    return {
      ok: true,
      summary: {
        activeQueues: toNumber(body.activeQueues),
        waitingCustomers: toNumber(body.waitingCustomers),
        longestWaitMinutes: toNumber(body.longestWaitMinutes),
        servedLastHour: toNumber(body.servedLastHour),
        generatedAt: typeof body.generatedAt === "string" ? body.generatedAt : "",
      },
    };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

function toNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
