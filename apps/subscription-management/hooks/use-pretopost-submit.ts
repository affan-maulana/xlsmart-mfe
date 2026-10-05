"use client";

import { useState } from "react";

import { withBasePath } from "@/lib/base-path";
import {
  pretopostSubmitSchema,
  type PretopostSubmitInput,
} from "@/lib/schemas/pretopost";
import type { SubmitPreToPostResponse } from "@/lib/types/pretopost";

export type FieldErrors = Partial<Record<keyof PretopostSubmitInput, string>>;

/**
 * Submit hook for the pre-to-post conversion flow.
 * Validates with Zod, POSTs through the BFF proxy, and returns the result.
 * Client never holds a token — the route handler reads the HttpOnly cookie.
 */
export function usePretopostSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function submit(
    payload: PretopostSubmitInput,
  ): Promise<SubmitPreToPostResponse | null> {
    const result = pretopostSubmitSchema.safeParse(payload);

    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof PretopostSubmitInput;
        if (!errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return null;
    }

    setFieldErrors({});
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(withBasePath("/api/pre-to-post/submit"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.message ?? "Submission failed");
        return null;
      }

      return json.data as SubmitPreToPostResponse;
    } catch {
      setError("The subscription service is unavailable. Try again shortly.");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { submit, isSubmitting, error, fieldErrors };
}
