"use client";

import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button, Input } from "@repo/ui";

import { type SearchValues } from "@/lib/schemas";

/**
 * The form writes the query to the URL instead of calling an API, so the server
 * component above owns data fetching. Query state lives in the URL - not in a
 * store - which is exactly why this platform needs no global state.
 */
export function CustomerSearchForm({ defaultQuery }: { defaultQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function submit(query: string) {
    const trimmed = query.trim();
    setIsSubmitting(true);

    const next = new URLSearchParams(searchParams.toString());
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");

    router.push(`?${next.toString()}`);
  }

  const { register, handleSubmit } = useForm<SearchValues>({
    defaultValues: { q: defaultQuery },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => submit(values.q))}
      className="flex flex-col gap-2 sm:flex-row"
      role="search"
    >
      <div className="relative flex-1">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          aria-label="Search customers"
          placeholder="Name, MSISDN or account number"
          className="pl-9"
          {...register("q")}
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="sm:w-auto">
        Search
      </Button>
    </form>
  );
}
