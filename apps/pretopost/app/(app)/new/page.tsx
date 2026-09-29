import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@repo/ui";

import { MigrationForm } from "@/components/migration-form";
import { basePath } from "@/lib/base-path";

export const metadata: Metadata = { title: "New migration" };

export default function NewMigrationPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New migration"
        description="Convert a line between prepaid and postpaid."
        breadcrumb={
          <Link href={basePath} className="hover:text-foreground underline-offset-4 hover:underline">
            All migration requests
          </Link>
        }
      />

      <div className="max-w-2xl">
        <MigrationForm />
      </div>
    </div>
  );
}
