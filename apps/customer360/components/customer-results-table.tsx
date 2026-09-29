"use client";

import { useRouter } from "next/navigation";

import { DataTable, StatusBadge, type DataTableColumn } from "@repo/ui";

import { statusTone, type CustomerSummary } from "@/lib/types";

/**
 * Interactive table needs a client component, so the server passes plain data
 * down and this file only decides where a click navigates.
 */
export function CustomerResultsTable({
  customers,
  query,
}: {
  customers: CustomerSummary[];
  query: string;
}) {
  const router = useRouter();

  const columns: DataTableColumn<CustomerSummary>[] = [
    {
      id: "fullName",
      header: "Customer",
      cell: (customer) => <span className="font-medium">{customer.fullName}</span>,
    },
    { id: "msisdn", header: "MSISDN", cell: (customer) => customer.msisdn },
    {
      id: "accountNumber",
      header: "Account",
      cell: (customer) => <span className="font-mono text-xs">{customer.accountNumber}</span>,
    },
    {
      id: "planType",
      header: "Plan",
      cell: (customer) => <span className="capitalize">{customer.planType}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (customer) => (
        <StatusBadge tone={statusTone(customer.status)} label={customer.status} size="sm" />
      ),
    },
  ];

  return (
    <section aria-label={`Customer results for ${query}`} className="rounded-xl border">
      <DataTable
        columns={columns}
        rows={customers}
        rowKey={(customer) => customer.id}
        onRowSelect={(customer) => router.push(`/${encodeURIComponent(customer.id)}`)}
        empty={`No customers matched “${query}”.`}
      />
    </section>
  );
}
