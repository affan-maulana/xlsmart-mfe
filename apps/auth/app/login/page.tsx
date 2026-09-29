import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/identity";
import { resolveReturnTarget } from "@/lib/auth/return-path";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "One account for Customer360, Queue and PreToPost.",
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const target = resolveReturnTarget(next);

  // Already signed in: never render the credential form again.
  if (await getCurrentUser()) {
    redirect(target);
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col gap-1">
          <span className="text-primary text-sm font-semibold tracking-tight">
            Meteor Platform
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-muted-foreground text-sm">
            One account for Customer360, Queue and PreToPost.
          </p>
        </div>
        <LoginForm returnTarget={target} />
      </div>
    </main>
  );
}
