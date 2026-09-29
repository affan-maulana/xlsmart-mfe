import type { Metadata } from "next";

import { PageHeader } from "@repo/ui";

import { MigrationTable } from "@/components/migration-table";
import { NewMigrationButton } from "@/components/new-migration-button";
import { listMigrations } from "@/lib/api/migrations";
import { UpstreamError } from "@/lib/http";

export const metadata: Metadata = { title: "Migration requests" };
export const dynamic = "force-dynamic";

export default async function MigrationListPage() {
  let requests: Awaited<ReturnType<typeof listMigrations>> = [];
  let notice: string | null = null;

  try {
    requests = await listMigrations();
  } catch (error) {
    notice =
      error instanceof UpstreamError
        ? error.message
        : "PreToPost service is temporarily unavailable.";
  }

  const pendingReview = requests.filter((request) => request.status === "pending-review").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Migration requests"
        description="Prepaid and postpaid conversions raised by this branch."
        meta={
          <span className="text-muted-foreground text-sm">
            {requests.length} total · {pendingReview} awaiting review
          </span>
        }
        actions={<NewMigrationButton />}
      />

      {notice ? (
        <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {notice}
        </p>
      ) : null}

      <MigrationTable requests={requests} />
    </div>
  );
}
