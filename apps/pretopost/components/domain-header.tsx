import { ArrowLeftIcon, ArrowLeftRight } from "lucide-react";
import Link from "next/link";

import { shellUrl } from "@/lib/config";

export function DomainHeader({ userName }: { userName?: string }) {
  const dashboard = shellUrl() || "/";

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur md:px-8">
      <Link
        href={dashboard}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeftIcon className="size-4" />
        Dashboard
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <ArrowLeftRight className="text-primary size-4" />
        <span className="text-sm font-semibold tracking-tight">PreToPost</span>
        {userName ? (
          <span className="text-muted-foreground hidden text-sm sm:inline">· {userName}</span>
        ) : null}
      </div>
    </header>
  );
}
