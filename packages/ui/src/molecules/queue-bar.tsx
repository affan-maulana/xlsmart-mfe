import { Timer, Users, Flag } from "lucide-react";
import type { AgentQueueInfo } from "../lib/types";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import { InfoBlock } from "./info-block";

export interface QueueBarProps {
  queue: AgentQueueInfo;
  onFinish?: () => void;
  onMark?: () => void;
  className?: string;
}

/** Ticket/queue meta strip: queue number, customer, handling time and actions. */
export function QueueBar({
  queue,
  onFinish,
  onMark,
  className,
}: QueueBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-10 gap-y-3 border-b border-border bg-card px-6 py-4",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
        <InfoBlock label="Queue No" value={queue.queueNumber} />

        <InfoBlock label="Customer Name" value={queue.customerName} />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
        <InfoBlock
          label="Handling Time"
          icon={<Timer className="size-icon text-primary" />}
          value={queue.handlingTime}
        />

        <Button
          type="button"
          variant="outline"
          className="ml-2"
          onClick={onFinish}
        >
          Selesai
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Tandai"
          onClick={onMark}
        >
          <Flag />
        </Button>
        <div className="bg-border h-6 w-px" />

        <InfoBlock
          label="Longest Time in Queue"
          icon={<Users className="size-icon text-primary" />}
          value={queue.longestTimeInQueue}
        />
      </div>
    </div>
  );
}
