import type { ReactNode } from "react";

import { requireSessionUser } from "@/lib/auth/session";
import { DomainHeader } from "@/components/domain-header";

export const dynamic = "force-dynamic";

/**
 * Every Customer360 screen sits behind the shared session cookie. The layout -
 * not a proxy - does the guarding, so the token is only ever read on the server.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireSessionUser();

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DomainHeader userName={user.name} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}
