import { ClockIcon, UsersIcon } from "lucide-react";

import { Skeleton } from "@repo/ui";

import { fetchQueueSummary } from "@/lib/queue/summary";

/**
 * Presentational only. There is deliberately no "open queue", "pause" or
 * "recall" control here: those are Queue domain workflows and belong in the
 * Queue application.
 */
export async function QueueInformationWidget() {
  const result = await fetchQueueSummary();

  return (
    <section aria-labelledby="queue-info-heading" className="grid gap-2">
      <h2
        id="queue-info-heading"
        className="text-muted-foreground px-1 text-[0.7rem] font-medium tracking-wide uppercase"
      >
        Queue at a glance
      </h2>

      {result.ok ? (
        <dl className="grid grid-cols-2 gap-2">
          <Metric label="Waiting" value={result.summary.waitingCustomers} icon={UsersIcon} />
          <Metric
            label="Longest wait"
            value={result.summary.longestWaitMinutes}
            suffix="min"
            icon={ClockIcon}
          />
        </dl>
      ) : (
        <p className="text-muted-foreground px-1 text-xs">
          {result.reason === "unauthorized"
            ? "Queue summary unavailable."
            : "Queue service is unreachable."}
        </p>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
  suffix,
  icon: Icon,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: typeof UsersIcon;
}) {
  return (
    <div className="rounded-md border p-2">
      <dt className="text-muted-foreground flex items-center gap-1 text-[0.7rem]">
        <Icon className="size-3" />
        {label}
      </dt>
      <dd className="mt-0.5 text-lg font-semibold tabular-nums">
        {value}
        {suffix ? <span className="text-muted-foreground ml-0.5 text-xs">{suffix}</span> : null}
      </dd>
    </div>
  );
}

export function QueueInformationWidgetSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Skeleton className="h-14" />
      <Skeleton className="h-14" />
    </div>
  );
}
