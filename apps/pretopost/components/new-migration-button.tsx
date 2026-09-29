"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@repo/ui";

import { basePath } from "@/lib/base-path";

export function NewMigrationButton() {
  return (
    <Button asChild>
      <Link href={`${basePath}/new`}>
        <PlusIcon />
        New migration
      </Link>
    </Button>
  );
}
