"use client";

import { LoaderCircleIcon, PauseIcon, PlayIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@repo/ui";

import { withBasePath } from "@/lib/base-path";
import type { QueueStatus } from "@/lib/types";

const transitions: Record<QueueStatus, Array<{ to: Exclude<QueueStatus, never>; label: string; icon: typeof PlayIcon }>> = {
  open: [
    { to: "paused", label: "Pause", icon: PauseIcon },
    { to: "closed", label: "Close", icon: XIcon },
  ],
  paused: [
    { to: "open", label: "Resume", icon: PlayIcon },
    { to: "closed", label: "Close", icon: XIcon },
  ],
  closed: [{ to: "open", label: "Reopen", icon: PlayIcon }],
};

/**
 * Queue lifecycle actions. These live in the Queue application, not the shell:
 * queue workflow ownership stays with the queue domain.
 */
export function QueueStatusControls({
  queueId,
  status,
}: {
  queueId: string;
  status: QueueStatus;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<QueueStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function change(to: QueueStatus) {
    setPending(to);
    setError(null);

    const response = await fetch(withBasePath(`/api/queues/${encodeURIComponent(queueId)}/status`), {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: to }),
    }).catch(() => null);

    setPending(null);

    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(typeof body?.message === "string" ? body.message : "Could not change status.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        {transitions[status].map((transition) => {
          const Icon = transition.icon;
          return (
            <Button
              key={transition.to}
              variant={transition.to === "closed" ? "destructive" : "outline"}
              onClick={() => change(transition.to)}
              disabled={pending !== null}
            >
              {pending === transition.to ? <LoaderCircleIcon className="animate-spin" /> : <Icon />}
              {transition.label}
            </Button>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
