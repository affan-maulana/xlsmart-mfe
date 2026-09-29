import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  PageHeader,
  StatusBadge,
  type DataTableColumn,
} from "@repo/ui";

import { LogInteractionModal } from "@/components/log-interaction-modal";
import { getCustomer, listInteractions } from "@/lib/api/customers";
import { UpstreamError } from "@/lib/http";
import { statusTone, type CustomerInteraction } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ customerId: string }>;
}): Promise<Metadata> {
  const { customerId } = await params;
  return { title: `Customer ${customerId}` };
}

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;

  let customer;
  try {
    customer = await getCustomer(customerId);
  } catch (error) {
    if (error instanceof UpstreamError && error.status === 404) notFound();
    throw error;
  }

  if (!customer) notFound();

  let interactions: CustomerInteraction[] = [];
  let interactionsNotice: string | null = null;
  try {
    interactions = await listInteractions(customerId);
  } catch (error) {
    interactionsNotice =
      error instanceof UpstreamError
        ? error.message
        : "Interaction history is temporarily unavailable.";
  }

  const interactionColumns: DataTableColumn<CustomerInteraction>[] = [
    {
      id: "createdAt",
      header: "When",
      cell: (item) => (
        <time dateTime={item.createdAt} className="text-muted-foreground whitespace-nowrap">
          {formatDate(item.createdAt)}
        </time>
      ),
    },
    {
      id: "channel",
      header: "Channel",
      cell: (item) => <span className="capitalize">{item.channel}</span>,
    },
    { id: "subject", header: "Subject", cell: (item) => item.subject },
    {
      id: "agentName",
      header: "Agent",
      cell: (item) => item.agentName ?? <span className="text-muted-foreground">—</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={customer.fullName}
        description={`Account ${customer.accountNumber}`}
        meta={
          <>
            <StatusBadge tone={statusTone(customer.status)} label={customer.status} />
            <span className="text-muted-foreground text-sm capitalize">{customer.planType}</span>
          </>
        }
        actions={<LogInteractionModal customerId={customer.id} customerName={customer.fullName} />}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <DetailCard title="Contact" empty={customer.email === null}>
          <Field label="Email" value={customer.email ?? "—"} />
          <Field label="MSISDN" value={customer.msisdn} />
        </DetailCard>
        <DetailCard title="Relationship" empty={!customer.segment}>
          <Field label="Segment" value={customer.segment ?? "—"} />
          <Field label="Customer since" value={customer.joinedAt ? formatDate(customer.joinedAt) : "—"} />
        </DetailCard>
        <DetailCard title="Account" empty={customer.balance === null}>
          <Field label="Balance" value={formatMoney(customer.balance)} />
          <Field label="Plan" value={customer.planType} />
        </DetailCard>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Interaction history</h2>
        {interactionsNotice ? (
          <p role="alert" className="bg-muted text-muted-foreground rounded-md px-3 py-2 text-sm">
            {interactionsNotice}
          </p>
        ) : (
          <div className="rounded-xl border">
            <DataTable
              columns={interactionColumns}
              rows={interactions}
              rowKey={(item) => item.id}
              empty="No interactions recorded yet."
            />
          </div>
        )}
      </section>
    </div>
  );
}

function DetailCard({
  title,
  empty,
  children,
}: {
  title: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {empty ? <CardDescription>Not available for this customer.</CardDescription> : null}
      </CardHeader>
      <CardContent className="grid gap-2">{children}</CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatMoney(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" }).format(value);
}
