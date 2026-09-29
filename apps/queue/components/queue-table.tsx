"use client";

import { useRouter } from "next/navigation";

import { DataTable, StatusBadge, type DataTableColumn } from "@repo/ui";

import { queueStatusTone, type QueueSummaryInfo } from "@/lib/types";

export function QueueTable({ queues }: { queues: QueueSummaryInfo[] }) {
  const router = useRouter();

  const columns: DataTableColumn<QueueSummaryInfo>[] = [
    {
      id: "name",
      header: "Queue",
      cell: (queue) => <span className="font-medium">{queue.name}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (queue) => (
        <StatusBadge
          tone={queueStatusTone(queue.status)}
          label={queue.status}
          size="sm"
          pulse={queue.status === "open" && queue.waitingCount > 0}
        />
      ),
    },
    {
      id: "waitingCount",
      header: "Waiting",
      cell: (queue) => <span className="tabular-nums">{queue.waitingCount}</span>,
    },
    {
      id: "longestWaitMinutes",
      header: "Longest wait",
      cell: (queue) => <span className="tabular-nums">{queue.longestWaitMinutes} min</span>,
    },
    {
      id: "counters",
      header: "Counters",
      cell: (queue) => (
        <span className="text-muted-foreground">{queue.counters.join(", ") || "—"}</span>
      ),
    },
  ];

  return (
    <section aria-label="Queues" className="rounded-xl border">
      <DataTable
        columns={columns}
        rows={queues}
        rowKey={(queue) => queue.id}
        onRowSelect={(queue) => router.push(`/${encodeURIComponent(queue.id)}`)}
        empty="No queues have been configured."
      />
    </section>
  );
}
