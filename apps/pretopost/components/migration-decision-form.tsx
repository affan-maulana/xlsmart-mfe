"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, LoaderCircleIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button, Field, Textarea } from "@repo/ui";

import { withBasePath } from "@/lib/base-path";
import { migrationDecisionSchema, type MigrationDecisionValues } from "@/lib/schemas";

/** Approve or reject a conversion; the decision is written to the audit trail. */
export function MigrationDecisionForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MigrationDecisionValues>({
    resolver: zodResolver(migrationDecisionSchema),
    defaultValues: { note: "" },
  });

  async function submit(decision: "approve" | "reject") {
    return handleSubmit(async ({ note }) => {
      setFormError(null);

      const response = await fetch(
        withBasePath(`/api/migrations/${encodeURIComponent(requestId)}/decision`),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ decision, note }),
        },
      ).catch(() => null);

      if (!response) {
        setFormError("Cannot reach the PreToPost service right now.");
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setFormError(typeof body?.message === "string" ? body.message : "Decision failed.");
        return;
      }

      reset();
      router.refresh();
    })();
  }

  return (
    <form className="grid gap-3" noValidate>
      <Field
        label="Note for the audit trail"
        htmlFor="note"
        required
        error={errors.note?.message}
      >
        <Textarea id="note" rows={3} placeholder="Verified identity and consent…" {...register("note")} />
      </Field>

      {formError ? (
        <p role="alert" className="text-destructive text-sm">
          {formError}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button onClick={() => submit("approve")} disabled={isSubmitting} size="sm" className="flex-1">
          {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : <CheckIcon />}
          Approve
        </Button>
        <Button
          onClick={() => submit("reject")}
          disabled={isSubmitting}
          size="sm"
          variant="outline"
          className="flex-1"
        >
          <XIcon />
          Reject
        </Button>
      </div>
    </form>
  );
}
