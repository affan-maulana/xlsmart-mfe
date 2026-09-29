import { redirect } from "next/navigation";

import { withBasePath } from "@/lib/base-path";

/**
 * The auth application has nothing to browse. Its root exists only to place
 * visitors on the sign-in screen.
 */
export default function AuthRootPage() {
  redirect(withBasePath("/login"));
}
