"use client";

import { LoaderCircleIcon, PhoneCallIcon, UserXIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, DataTable, StatusBadge, type DataTableColumn } from "@repo/ui";

import { withBasePath } from "@/lib/base-path";
import { ticketStatusTone, type QueueTicket } from "@/lib/types";

interface TicketTableProps {
  queueId: string;
  tickets: QueueTicket[];
  counters: string[];
  acceptsActions: boolean;
}

/**
 * Ticket operations are Queue domain workflows. The counter select is supplied
 * by the domain, so the shared UI layer stays presentational.
 */
export function TicketTable({ queueId, tickets, counters, acceptsActions }: TicketTableProps) {
  const router = useRouter();
  const [counter, setCounter] = useState(counters[0] ?? "C1");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "call-next" | "serve" | "no-show") {
    setPending(action);
    setError(null);

    const response = await fetch(withBasePath(`/api/queues/${encodeURIComponent(queueId)}/tickets/actions`), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, counter }),
    }).catch(() => null);

    setPending(null);

    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(typeof body?.message === "string" ? body.message : "Ticket action failed.");
      return;
    }

    router.refresh();
  }

  const columns: DataTableColumn<QueueTicket>[] = [
    {
      id: "reference",
      header: "Ticket",
      cell: (ticket) => <span className="font-mono text-xs font-medium">{ticket.reference}</span>,
    },
    { id: "service", header: "Service", cell: (ticket) => ticket.service },
    {
      id: "customerName",
      header: "Customer",
      cell: (ticket) => ticket.customerName ?? <span className="text-muted-foreground">Walk-in</span>,
    },
    {
      id: "waitedMinutes",
      header: "Waited",
      cell: (ticket) => <span className="tabular-nums">{ticket.waitedMinutes} min</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (ticket) => (
        <StatusBadge tone={ticketStatusTone(ticket.status)} label={ticket.status} size="sm" />
      ),
    },
  ];

  return (
    <section aria-label="Tickets" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Tickets</h2>

        {acceptsActions ? (
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-muted-foreground flex items-center gap-2 text-sm">
              Counter
              <select
                value={counter}
                onChange={(event) => setCounter(event.target.value)}
                className="border-input h-8 rounded-md border bg-transparent px-2 text-sm"
              >
                {(counters.length > 0 ? counters : ["C1"]).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <Button size="sm" onClick={() => act("call-next")} disabled={pending !== null}>
              {pending === "call-next" ? <LoaderCircleIcon className="animate-spin" /> : <PhoneCallIcon />}
              Call next
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => act("serve")}
              disabled={pending !== null}
            >
              {pending === "serve" ? <LoaderCircleIcon className="animate-spin" /> : null}
              Mark served
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => act("no-show")}
              disabled={pending !== null}
            >
              {pending === "no-show" ? <LoaderCircleIcon className="animate-spin" /> : <UserXIcon />}
              No-show
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            This queue is not open, so ticket actions are disabled.
          </p>
        )}
      </div>

      {error ? (
        <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}

      <div className="rounded-xl border">
        <DataTable columns={columns} rows={tickets} rowKey={(ticket) => ticket.id} empty="No tickets in this queue." />
      </div>
    </section>
  );
}
