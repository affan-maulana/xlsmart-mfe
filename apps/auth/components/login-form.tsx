"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button, Field, Input } from "@repo/ui";

import { withBasePath } from "@/lib/base-path";
import { loginSchema, type LoginValues } from "@/lib/auth/schema";

/**
 * The client never sees the token: this handler reads only the profile fields in
 * the response, while the JWT travels back as an HttpOnly cookie.
 */
export function LoginForm({ returnTarget }: { returnTarget: string }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setIsSubmitting(true);

    const response = await fetch(withBasePath("/api/auth/login"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    }).catch(() => null);

    if (!response) {
      setIsSubmitting(false);
      setFormError("Cannot reach the sign-in service. Check your connection and try again.");
      return;
    }

    if (!response.ok) {
      setIsSubmitting(false);
      const body = await response.json().catch(() => null);
      setFormError(typeof body?.message === "string" ? body.message : "Sign in failed.");
      return;
    }

    // A real navigation, not a router push: the target is another application.
    // In production that is a same-origin sub-path; in development it is the
    // shell's port. Either way the session cookie is already on the response.
    window.location.assign(returnTarget);
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <Field label="Email" htmlFor="email" required error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="agent@company.com"
          {...register("email")}
        />
      </Field>

      <Field label="Password" htmlFor="password" required error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
      </Field>

      {formError ? (
        <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {formError}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
        {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
        {isSubmitting ? "Signing in" : "Sign in"}
      </Button>
    </form>
  );
}
