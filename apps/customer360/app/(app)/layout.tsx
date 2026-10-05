import type { ReactNode } from "react";

import { requireSession } from "@repo/auth";
import { QueueBar } from "@repo/ui";

import { loginUrl } from "@/lib/config";
import { DomainHeader } from "@/components/domain-header";

export const dynamic = "force-dynamic";

// TODO: replace with server-side data from this app's BFF once the agent's
// active queue ticket contract is available.
const mockQueue = {
  id: "Q-001",
  queueNumber: "Q-001",
  customerName: "customer@example.com",
  handlingTime: "02:15",
  longestTimeInQueue: "02:15",
};

/**
 * Every Customer360 screen sits behind the shared session cookie. Identity is
 * read through the auth application's session contract (@repo/auth) - this
 * application never interprets the token itself.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireSession({ loginUrl: loginUrl() });

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DomainHeader userName={user.name} />
      <QueueBar queue={mockQueue} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}
