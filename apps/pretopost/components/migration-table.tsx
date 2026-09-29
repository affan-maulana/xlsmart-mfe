"use client";

import { useRouter } from "next/navigation";

import { DataTable, StatusBadge, type DataTableColumn } from "@repo/ui";

import { migrationStatusTone, type MigrationRequest } from "@/lib/types";

export function MigrationTable({ requests }: { requests: MigrationRequest[] }) {
  const router = useRouter();

  const columns: DataTableColumn<MigrationRequest>[] = [
    {
      id: "reference",
      header: "Reference",
      cell: (request) => (
        <span className="font-mono text-xs font-medium">{request.reference}</span>
      ),
    },
    { id: "customerName", header: "Customer", cell: (request) => request.customerName },
    {
      id: "msisdn",
      header: "MSISDN",
      cell: (request) => <span className="font-mono text-xs">{request.msisdn}</span>,
    },
    {
      id: "direction",
      header: "Direction",
      cell: (request) => request.direction.replaceAll("-", " → "),
    },
    { id: "targetPlan", header: "Target plan", cell: (request) => request.targetPlan },
    {
      id: "status",
      header: "Status",
      cell: (request) => (
        <StatusBadge tone={migrationStatusTone(request.status)} label={request.status} size="sm" />
      ),
    },
  ];

  return (
    <section aria-label="Migration requests" className="rounded-xl border">
      <DataTable
        columns={columns}
        rows={requests}
        rowKey={(request) => request.id}
        onRowSelect={(request) => router.push(`/${encodeURIComponent(request.id)}`)}
        empty="No migration requests yet."
      />
    </section>
  );
}
