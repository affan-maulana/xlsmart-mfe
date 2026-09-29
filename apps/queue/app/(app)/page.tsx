import type { Metadata } from "next";

import { PageHeader } from "@repo/ui";

import { CreateQueueModal } from "@/components/create-queue-modal";
import { QueueTable } from "@/components/queue-table";
import { listQueues } from "@/lib/api/queues";
import { UpstreamError } from "@/lib/http";

export const metadata: Metadata = { title: "Queues" };
export const dynamic = "force-dynamic";

export default async function QueueListPage() {
  let queues: Awaited<ReturnType<typeof listQueues>> = [];
  let notice: string | null = null;

  try {
    queues = await listQueues();
  } catch (error) {
    notice =
      error instanceof UpstreamError ? error.message : "Queue service is temporarily unavailable.";
  }

  const openCount = queues.filter((queue) => queue.status === "open").length;
  const waitingTotal = queues.reduce((total, queue) => total + queue.waitingCount, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Queues"
        description="Lifecycle, status and operations for every service queue."
        meta={
          <>
            <span className="text-muted-foreground text-sm">
              {openCount} open · {waitingTotal} waiting
            </span>
          </>
        }
        actions={<CreateQueueModal />}
      />

      {notice ? (
        <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {notice}
        </p>
      ) : null}

      <QueueTable queues={queues} />
    </div>
  );
}
