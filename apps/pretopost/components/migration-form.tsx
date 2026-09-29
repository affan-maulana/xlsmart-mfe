"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button, Card, CardContent, Field, Input, Textarea } from "@repo/ui";

import { basePath, withBasePath } from "@/lib/base-path";
import { createMigrationSchema, type CreateMigrationValues } from "@/lib/schemas";

const plans = [
  "Postpaid 30",
  "Postpaid 60",
  "Postpaid 100",
  "Prepay Flex 15",
  "Prepay Max 25",
] as const;

/**
 * The whole conversion workflow is owned by this application: the schema, the
 * validation and the submission all live inside the PreToPost boundary.
 */
export function MigrationForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateMigrationValues>({
    resolver: zodResolver(createMigrationSchema),
    defaultValues: {
      msisdn: "",
      direction: "prepaid-to-postpaid",
      targetPlan: "",
      reason: "",
      creditCheckRequired: true,
      customerConsent: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const response = await fetch(withBasePath("/api/migrations"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    }).catch(() => null);

    if (!response) {
      setFormError("Cannot reach the PreToPost service right now.");
      return;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const firstIssue = Array.isArray(body?.issues) ? body.issues[0]?.message : undefined;
      setFormError(firstIssue ?? body?.message ?? "Could not submit the migration request.");
      return;
    }

    const body = await response.json().catch(() => null);
    const id = body?.request?.id;
    router.push(id ? `${basePath}/${encodeURIComponent(id)}` : basePath);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <Card>
        <CardContent className="grid gap-4">
          <Field label="MSISDN" htmlFor="msisdn" required error={errors.msisdn?.message} hint="For example 0123456789">
            <Input id="msisdn" inputMode="tel" placeholder="0123456789" {...register("msisdn")} />
          </Field>

          <Field label="Direction" htmlFor="direction" required>
            <select
              id="direction"
              className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm"
              {...register("direction")}
            >
              <option value="prepaid-to-postpaid">Prepaid → Postpaid</option>
              <option value="postpaid-to-prepaid">Postpaid → Prepaid</option>
            </select>
          </Field>

          <Field
            label="Target plan"
            htmlFor="targetPlan"
            required
            error={errors.targetPlan?.message}
          >
            <select
              id="targetPlan"
              className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm"
              {...register("targetPlan")}
            >
              <option value="">Select a plan</option>
              {plans.map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Reason" htmlFor="reason" required error={errors.reason?.message}>
            <Textarea id="reason" rows={4} placeholder="Why this line is moving…" {...register("reason")} />
          </Field>

          <div className="grid gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                {...register("creditCheckRequired")}
              />
              Credit check required
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-primary" {...register("customerConsent")} />
              Customer consent captured
            </label>
            {errors.customerConsent ? (
              <p role="alert" className="text-destructive text-xs font-medium">
                {errors.customerConsent.message}
              </p>
            ) : null}
          </div>

          {formError ? (
            <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
              {formError}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost">
          <Link href={basePath}>
            <ArrowLeftIcon />
            Back
          </Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
          Submit migration
        </Button>
      </div>
    </form>
  );
}
