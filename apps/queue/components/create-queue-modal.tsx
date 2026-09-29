"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button, Field, Input, Modal } from "@repo/ui";

import { withBasePath } from "@/lib/base-path";
import { createQueueSchema, type CreateQueueValues } from "@/lib/schemas";

export function CreateQueueModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateQueueValues>({
    resolver: zodResolver(createQueueSchema),
    defaultValues: { name: "", slaMinutes: 15, priorityRouting: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const response = await fetch(withBasePath("/api/queues"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    }).catch(() => null);

    if (!response) {
      setFormError("Cannot reach the Queue service right now.");
      return;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setFormError(typeof body?.message === "string" ? body.message : "Could not create queue.");
      return;
    }

    reset();
    setOpen(false);
    router.refresh();
  });

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="New queue"
      description="Opens a queue that agents can serve tickets from."
      size="sm"
      trigger={
        <Button>
          <PlusIcon />
          New queue
        </Button>
      }
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="create-queue-form" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
            Create queue
          </Button>
        </>
      }
    >
      <form id="create-queue-form" onSubmit={onSubmit} className="grid gap-4" noValidate>
        <Field label="Name" htmlFor="name" required error={errors.name?.message}>
          <Input id="name" placeholder="Postpaid billing" {...register("name")} />
        </Field>

        <Field
          label="Target wait (minutes)"
          htmlFor="slaMinutes"
          required
          error={errors.slaMinutes?.message}
          hint="Queue rules that enforce this target stay inside the Queue domain."
        >
          <Input
            id="slaMinutes"
            type="number"
            inputMode="numeric"
            min={1}
            max={240}
            {...register("slaMinutes", { valueAsNumber: true })}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-primary" {...register("priorityRouting")} />
          Priority routing for vulnerable customers
        </label>

        {formError ? (
          <p role="alert" className="text-destructive text-sm">
            {formError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
