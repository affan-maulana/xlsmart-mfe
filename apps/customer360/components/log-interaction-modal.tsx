"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button, Field, Input, Modal, Textarea } from "@repo/ui";

import { withBasePath } from "@/lib/base-path";
import { interactionSchema, type InteractionValues } from "@/lib/schemas";

const channels = [
  { value: "call", label: "Call" },
  { value: "chat", label: "Chat" },
  { value: "email", label: "Email" },
  { value: "visit", label: "Visit" },
] as const;

/**
 * Records an interaction through this domain's own BFF, then revalidates the
 * server-rendered history. No client-side cache is kept.
 */
export function LogInteractionModal({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Omit<InteractionValues, "customerId">>({
    resolver: zodResolver(interactionSchema.omit({ customerId: true })),
    defaultValues: { channel: "call", subject: "", note: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const response = await fetch(withBasePath("/api/interactions"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ customerId, ...values }),
    }).catch(() => null);

    if (!response) {
      setFormError("Cannot reach Customer360 right now.");
      return;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setFormError(typeof body?.message === "string" ? body.message : "Could not save.");
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
      title="Log an interaction"
      description={`Recorded against ${customerName}.`}
      trigger={
        <Button>
          <PlusIcon />
          Log interaction
        </Button>
      }
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="log-interaction-form" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
            Save interaction
          </Button>
        </>
      }
    >
      <form id="log-interaction-form" onSubmit={onSubmit} className="grid gap-4" noValidate>
        <Field label="Channel" htmlFor="channel" error={errors.channel?.message}>
          <select
            id="channel"
            className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm"
            {...register("channel")}
          >
            {channels.map((channel) => (
              <option key={channel.value} value={channel.value}>
                {channel.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Subject" htmlFor="subject" required error={errors.subject?.message}>
          <Input id="subject" placeholder="Bill shock query" {...register("subject")} />
        </Field>

        <Field
          label="Note"
          htmlFor="note"
          required
          error={errors.note?.message}
          hint="What the customer asked for and what you did about it."
        >
          <Textarea id="note" rows={5} {...register("note")} />
        </Field>

        {formError ? (
          <p role="alert" className="text-destructive text-sm">
            {formError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
