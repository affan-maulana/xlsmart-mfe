import type { Metadata } from "next";

import { PageHeader } from "@repo/ui";

import { CustomerResultsTable } from "@/components/customer-results-table";
import { CustomerSearchForm } from "@/components/customer-search-form";
import { searchCustomers } from "@/lib/api/customers";
import { UpstreamError } from "@/lib/http";
import { searchSchema } from "@/lib/schemas";
import type { CustomerSummary } from "@/lib/types";

export const metadata: Metadata = { title: "Find a customer" };

/**
 * Server-first: the search executes during rendering when `?q=` is present, so
 * results arrive in the initial HTML and the query stays shareable.
 */
export default async function CustomerSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const parsed = searchSchema.safeParse({ q: q ?? "" });

  let results: CustomerSummary[] = [];
  let notice: string | null = null;

  if (parsed.success) {
    try {
      results = await searchCustomers(parsed.data.q);
    } catch (error) {
      notice =
        error instanceof UpstreamError
          ? error.message
          : "Customer search is temporarily unavailable.";
    }
  } else if (q) {
    notice = parsed.error.issues[0]?.message ?? "Invalid search.";
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Find a customer"
        description="Search by name, MSISDN or account number."
      />

      <CustomerSearchForm defaultQuery={parsed.success ? parsed.data.q : (q ?? "")} />

      {notice ? (
        <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {notice}
        </p>
      ) : null}

      {parsed.success ? (
        <CustomerResultsTable customers={results} query={parsed.data.q} />
      ) : (
        <p className="text-muted-foreground text-sm">
          Enter a search to see customer records.
        </p>
      )}
    </div>
  );
}
