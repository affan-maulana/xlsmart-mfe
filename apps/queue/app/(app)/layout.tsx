import type { ReactNode } from "react";

import { requireSession } from "@repo/auth";

import { loginUrl } from "@/lib/config";
import { DomainHeader } from "@/components/domain-header";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireSession({ loginUrl: loginUrl() });

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DomainHeader userName={user.name} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}
