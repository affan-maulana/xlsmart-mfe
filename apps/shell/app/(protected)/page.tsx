import type { Metadata } from "next";
import { ArrowRightIcon, ClockIcon, ListChecksIcon, Users } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader } from "@repo/ui";

import { getIdentity } from "@/lib/auth/session";
import { getNavigation } from "@/lib/config";
import { fetchQueueSummary } from "@/lib/queue/summary";

export const metadata: Metadata = { title: "Dashboard" };

const domains = [
  {
    id: "customer360",
    title: "Customer360",
    description: "Search customers, review profiles and log interactions.",
    icon: Users,
  },
  {
    id: "queue",
    title: "Queue",
    description: "Run queue lifecycles, statuses and routing rules.",
    icon: ListChecksIcon,
  },
  {
    id: "pretopost",
    title: "PreToPost",
    description: "Move prepaid customers onto postpaid plans.",
    icon: ArrowRightIcon,
  },
] as const;

/**
 * Platform landing page. It links into each domain application; it does not
 * render any of their screens.
 */
export default async function DashboardPage() {
  const [identity, queueSummary] = await Promise.all([getIdentity(), fetchQueueSummary()]);
  const user = identity.status === "authenticated" ? identity.user : null;

  const hrefById = new Map(getNavigation().map((item) => [item.id, item.href]));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        title={user?.name ? `Welcome back, ${user.name}` : "Dashboard"}
        description="Every domain below is an independently deployed application."
      />

      {queueSummary.ok ? (
        <section aria-label="Queue summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Waiting customers" value={queueSummary.summary.waitingCustomers} />
          <Stat label="Active queues" value={queueSummary.summary.activeQueues} />
          <Stat
            label="Longest wait"
            value={queueSummary.summary.longestWaitMinutes}
            suffix="min"
          />
          <Stat label="Served last hour" value={queueSummary.summary.servedLastHour} />
        </section>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClockIcon className="text-muted-foreground size-4" />
              Queue summary unavailable
            </CardTitle>
            <CardDescription>
              The Queue application did not answer. Everything else on this platform still works.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <section aria-label="Domains" className="grid gap-4 md:grid-cols-3">
        {domains.map((domain) => {
          const href = hrefById.get(domain.id) ?? "/";
          const Icon = domain.icon;

          return (
            <Card key={domain.id} className="transition-colors hover:border-primary/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="text-primary size-4" />
                  {domain.title}
                </CardTitle>
                <CardDescription>{domain.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={href}
                  className="text-primary inline-flex items-center gap-1 text-sm font-medium"
                >
                  Open {domain.title}
                  <ArrowRightIcon className="size-4" />
                  <span className="sr-only"> (opens in the {domain.title} application)</span>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">
        {value}
        {suffix ? <span className="text-muted-foreground ml-1 text-sm">{suffix}</span> : null}
      </p>
    </div>
  );
}
