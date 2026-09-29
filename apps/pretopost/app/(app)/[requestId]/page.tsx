import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
  StatusBadge,
} from "@repo/ui";

import { MigrationDecisionForm } from "@/components/migration-decision-form";
import { getMigration } from "@/lib/api/migrations";
import { UpstreamError } from "@/lib/http";
import { migrationStatusTone } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ requestId: string }>;
}): Promise<Metadata> {
  const { requestId } = await params;
  return { title: `Migration ${requestId}` };
}

export default async function MigrationDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;

  let request;
  try {
    request = await getMigration(requestId);
  } catch (error) {
    if (error instanceof UpstreamError && error.status === 404) notFound();
    throw error;
  }

  if (!request) notFound();

  const reviewable = request.status === "pending-review";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={request.customerName}
        description={`${request.reference} · ${request.direction.replaceAll("-", " → ")}`}
        meta={
          <>
            <StatusBadge tone={migrationStatusTone(request.status)} label={request.status} />
            <span className="text-muted-foreground text-sm">{request.targetPlan}</span>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Request details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Row label="MSISDN" value={request.msisdn} mono />
            <Row label="Reason" value={request.reason} />
            <Row label="Credit check" value={request.creditCheckRequired ? "Required" : "Not required"} />
            <Row label="Deposit" value={formatMoney(request.depositAmount)} />
            <Row label="Raised by" value={request.requestedBy} />
            <Row label="Raised on" value={formatDateTime(request.requestedAt)} />
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Decision</CardTitle>
            </CardHeader>
            <CardContent>
              {reviewable ? (
                <MigrationDecisionForm requestId={request.id} />
              ) : (
                <p className="text-muted-foreground text-sm">
                  This request is {request.status.replace(/-/g, " ")}, so no decision can be recorded.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit trail</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-3">
                {request.timeline.length === 0 ? (
                  <li className="text-muted-foreground text-sm">Nothing recorded yet.</li>
                ) : (
                  request.timeline.map((entry) => (
                    <li key={entry.id} className="grid gap-0.5 text-sm">
                      <span className="font-medium">{entry.label}</span>
                      <span className="text-muted-foreground text-xs">
                        {formatDateTime(entry.at)}
                        {entry.actor ? ` · ${entry.actor}` : ""}
                      </span>
                    </li>
                  ))
                )}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[10rem_1fr]">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-sm" : undefined}>{value}</span>
    </div>
  );
}

function formatMoney(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" }).format(value);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
