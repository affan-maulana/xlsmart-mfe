import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/http", () => ({
  bffFetch: vi.fn(),
  errorResponse: () => Response.json({ message: "x" }, { status: 500 }),
  UpstreamError: class extends Error {},
}));

import { bffFetch } from "@/lib/http";
import { getQueueAggregates } from "@/lib/api/queues";
import { ticketActionSchema, createQueueSchema } from "@/lib/schemas";
import { queueStatusTone, ticketStatusTone } from "@/lib/types";

const mockedFetch = vi.mocked(bffFetch);

describe("getQueueAggregates", () => {
  it("counts only queues that are still running", async () => {
    mockedFetch.mockResolvedValue({
      queues: [
        { id: "1", name: "Postpaid billing", status: "open", waitingCount: 8, servedLastHour: 12, longestWaitMinutes: 14, counters: ["C1"], },
        { id: "2", name: "Device swap", status: "paused", waitingCount: 3, servedLastHour: 1, longestWaitMinutes: 41, counters: ["C2"], },
        { id: "3", name: "Legacy", status: "closed", waitingCount: 99, servedLastHour: 99, longestWaitMinutes: 999, counters: [], },
      ],
    });

    const aggregates = await getQueueAggregates();

    // Closed queues must not inflate the numbers the shell widget displays.
    expect(aggregates).toMatchObject({
      activeQueues: 2,
      waitingCustomers: 11,
      longestWaitMinutes: 41,
      servedLastHour: 13,
    });
    expect(aggregates.generatedAt).toMatch(/^\d{4}-/);
  });

  it("returns zeroes when nothing is running", async () => {
    mockedFetch.mockResolvedValue({ queues: [] });
    expect(await getQueueAggregates()).toMatchObject({
      activeQueues: 0,
      waitingCustomers: 0,
      longestWaitMinutes: 0,
      servedLastHour: 0,
    });
  });
});

describe("createQueueSchema", () => {
  it("requires a sane SLA window", () => {
    expect(
      createQueueSchema.safeParse({ name: "Device swap", slaMinutes: 15, priorityRouting: true })
        .success,
    ).toBe(true);
    expect(
      createQueueSchema.safeParse({ name: "D", slaMinutes: 15, priorityRouting: false }).success,
    ).toBe(false);
    expect(
      createQueueSchema.safeParse({ name: "Valid name", slaMinutes: 0, priorityRouting: false })
        .success,
    ).toBe(false);
    expect(
      createQueueSchema.safeParse({ name: "Valid name", slaMinutes: 12.5, priorityRouting: false })
        .success,
    ).toBe(false);
  });
});

describe("ticketActionSchema", () => {
  it("accepts only the actions this domain exposes", () => {
    expect(ticketActionSchema.safeParse({ action: "call-next", counter: "C1" }).success).toBe(true);
    expect(ticketActionSchema.safeParse({ action: "recall" }).success).toBe(true);
    expect(ticketActionSchema.safeParse({ action: "delete-everything" }).success).toBe(false);
  });
});

describe("status tones", () => {
  it("keeps queue and ticket vocabulary distinct from presentation", () => {
    expect(queueStatusTone("open")).toBe("success");
    expect(queueStatusTone("paused")).toBe("warning");
    expect(ticketStatusTone("waiting")).toBe("warning");
    expect(ticketStatusTone("no-show")).toBe("danger");
  });
});
