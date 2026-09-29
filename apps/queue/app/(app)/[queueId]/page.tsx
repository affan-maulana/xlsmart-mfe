import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader, StatusBadge } from "@repo/ui";

import { QueueStatusControls } from "@/components/queue-status-controls";
import { TicketTable } from "@/components/ticket-table";
import { getQueue } from "@/lib/api/queues";
import { UpstreamError } from "@/lib/http";
import { queueStatusTone } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ queueId: string }>;
}): Promise<Metadata> {
  const { queueId } = await params;
  return { title: `Queue ${queueId}` };
}

export default async function QueueDetailPage({
  params,
}: {
  params: Promise<{ queueId: string }>;
}) {
  const { queueId } = await params;

  let queue;
  try {
    queue = await getQueue(queueId);
  } catch (error) {
    if (error instanceof UpstreamError && error.status === 404) notFound();
    throw error;
  }

  if (!queue) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={queue.name}
        description={`${queue.waitingCount} waiting · longest wait ${queue.longestWaitMinutes} min`}
        meta={
          <>
            <StatusBadge
              tone={queueStatusTone(queue.status)}
              label={queue.status}
              pulse={queue.status === "open"}
            />
            <span className="text-muted-foreground text-sm">
              Target {queue.slaMinutes} min · {queue.priorityRouting ? "priority routing on" : "standard routing"}
            </span>
          </>
        }
        actions={<QueueStatusControls queueId={queue.id} status={queue.status} />}
      />

      <TicketTable
        queueId={queue.id}
        tickets={queue.tickets}
        counters={queue.counters}
        acceptsActions={queue.status === "open"}
      />
    </div>
  );
}
